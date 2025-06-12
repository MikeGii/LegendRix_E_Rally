// src/hooks/useGameManagement.ts - Universal Game Management Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DatabaseService } from '@/lib/database'
import { QUERY_KEYS } from '@/lib/constants'
import type { 
  Game, 
  GameType, 
  GameEvent, 
  GameClass, 
  EventTrack,
  GameFormData,
  GameTypeFormData,
  GameEventFormData,
  GameClassFormData
} from '@/types/game'

// ============= Main Centralized Hook =============
export function useGameManagement(selectedGameId?: string) {
  const queryClient = useQueryClient()
  
  // Primary data queries
  const gamesQuery = useQuery({
    queryKey: QUERY_KEYS.games.lists(),
    queryFn: () => DatabaseService.findMany<Game>('games', {
      sort: [{ field: 'created_at', direction: 'desc' }]
    }),
    staleTime: 5 * 60 * 1000,
    retry: 1
  })

  const gameTypesQuery = useQuery({
    queryKey: QUERY_KEYS.gameTypes(selectedGameId),
    queryFn: () => selectedGameId ? DatabaseService.findMany<GameType>('game_types', {
      filters: [{ field: 'game_id', operator: 'eq', value: selectedGameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!selectedGameId,
    staleTime: 5 * 60 * 1000,
  })

  const gameEventsQuery = useQuery({
    queryKey: QUERY_KEYS.gameEvents(selectedGameId),
    queryFn: () => selectedGameId ? DatabaseService.findMany<GameEvent>('game_events', {
      filters: [{ field: 'game_id', operator: 'eq', value: selectedGameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!selectedGameId,
    staleTime: 5 * 60 * 1000,
  })

  const gameClassesQuery = useQuery({
    queryKey: QUERY_KEYS.gameClasses(selectedGameId),
    queryFn: () => selectedGameId ? DatabaseService.findMany<GameClass>('game_classes', {
      filters: [{ field: 'game_id', operator: 'eq', value: selectedGameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!selectedGameId,
    staleTime: 5 * 60 * 1000,
  })

  // Unified refresh function
  const refetch = () => {
    gamesQuery.refetch()
    if (selectedGameId) {
      gameTypesQuery.refetch()
      gameEventsQuery.refetch()
      gameClassesQuery.refetch()
    }
  }

  return {
    // Data
    games: gamesQuery.data || [],
    gameTypes: gameTypesQuery.data || [],
    gameEvents: gameEventsQuery.data || [],
    gameClasses: gameClassesQuery.data || [],
    
    // Loading states
    isLoading: gamesQuery.isLoading || 
               (selectedGameId && (
                 gameTypesQuery.isLoading || 
                 gameEventsQuery.isLoading || 
                 gameClassesQuery.isLoading
               )),
    
    // Error handling
    error: gamesQuery.error || 
           gameTypesQuery.error || 
           gameEventsQuery.error || 
           gameClassesQuery.error,
    
    // Actions
    refetch
  }
}

// ============= Game Mutations =============
export function useGameMutations() {
  const queryClient = useQueryClient()

  const invalidateGames = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.all })
  }

  const createGame = useMutation({
    mutationFn: async (gameData: GameFormData) => {
      return DatabaseService.create<Game>('games', {
        ...gameData,
        is_active: true
      })
    },
    onSuccess: invalidateGames,
    onError: (error) => {
      console.error('❌ Game creation failed:', error)
      throw error
    }
  })

  const updateGame = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Game> & { id: string }) => {
      return DatabaseService.update<Game>('games', id, updates)
    },
    onSuccess: invalidateGames,
    onError: (error) => {
      console.error('❌ Game update failed:', error)
      throw error
    }
  })

  const deleteGame = useMutation({
    mutationFn: async (gameId: string) => {
      await DatabaseService.delete('games', gameId)
      return gameId
    },
    onSuccess: invalidateGames,
    onError: (error) => {
      console.error('❌ Game deletion failed:', error)
      throw error
    }
  })

  return { 
    createGame, 
    updateGame, 
    deleteGame,
    isCreating: createGame.isPending,
    isUpdating: updateGame.isPending,
    isDeleting: deleteGame.isPending
  }
}

// ============= Game Type Mutations =============
export function useGameTypeMutations() {
  const queryClient = useQueryClient()

  const invalidateTypes = (gameId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameTypes(gameId) })
  }

  const createGameType = useMutation({
    mutationFn: async (typeData: GameTypeFormData) => {
      return DatabaseService.create<GameType>('game_types', {
        ...typeData,
        is_active: true,
        min_participants: typeData.min_participants || 1
      })
    },
    onSuccess: (data) => invalidateTypes(data.game_id),
    onError: (error) => {
      console.error('❌ Game type creation failed:', error)
      throw error
    }
  })

  const updateGameType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameType> & { id: string }) => {
      return DatabaseService.update<GameType>('game_types', id, updates)
    },
    onSuccess: (data) => invalidateTypes(data.game_id),
    onError: (error) => {
      console.error('❌ Game type update failed:', error)
      throw error
    }
  })

  const deleteGameType = useMutation({
    mutationFn: async (typeId: string) => {
      await DatabaseService.delete('game_types', typeId)
      return typeId
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.all }),
    onError: (error) => {
      console.error('❌ Game type deletion failed:', error)
      throw error
    }
  })

  return { 
    createGameType, 
    updateGameType, 
    deleteGameType,
    isCreating: createGameType.isPending,
    isUpdating: updateGameType.isPending,
    isDeleting: deleteGameType.isPending
  }
}

// ============= Game Event Mutations =============
export function useGameEventMutations() {
  const queryClient = useQueryClient()

  const invalidateEvents = (gameId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameEvents(gameId) })
  }

  const createGameEvent = useMutation({
    mutationFn: async (eventData: GameEventFormData) => {
      return DatabaseService.create<GameEvent>('game_events', {
        ...eventData,
        is_active: true
      })
    },
    onSuccess: (data) => invalidateEvents(data.game_id),
    onError: (error) => {
      console.error('❌ Game event creation failed:', error)
      throw error
    }
  })

  const updateGameEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameEvent> & { id: string }) => {
      return DatabaseService.update<GameEvent>('game_events', id, updates)
    },
    onSuccess: (data) => invalidateEvents(data.game_id),
    onError: (error) => {
      console.error('❌ Game event update failed:', error)
      throw error
    }
  })

  const deleteGameEvent = useMutation({
    mutationFn: async (eventId: string) => {
      await DatabaseService.delete('game_events', eventId)
      return eventId
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.all }),
    onError: (error) => {
      console.error('❌ Game event deletion failed:', error)
      throw error
    }
  })

  return { 
    createGameEvent, 
    updateGameEvent, 
    deleteGameEvent,
    isCreating: createGameEvent.isPending,
    isUpdating: updateGameEvent.isPending,
    isDeleting: deleteGameEvent.isPending
  }
}

// ============= Game Class Mutations =============
export function useGameClassMutations() {
  const queryClient = useQueryClient()

  const invalidateClasses = (gameId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameClasses(gameId) })
  }

  const createGameClass = useMutation({
    mutationFn: async (classData: GameClassFormData) => {
      return DatabaseService.create<GameClass>('game_classes', {
        ...classData,
        is_active: true
      })
    },
    onSuccess: (data) => invalidateClasses(data.game_id),
    onError: (error) => {
      console.error('❌ Game class creation failed:', error)
      throw error
    }
  })

  const updateGameClass = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameClass> & { id: string }) => {
      return DatabaseService.update<GameClass>('game_classes', id, updates)
    },
    onSuccess: (data) => invalidateClasses(data.game_id),
    onError: (error) => {
      console.error('❌ Game class update failed:', error)
      throw error
    }
  })

  const deleteGameClass = useMutation({
    mutationFn: async (classId: string) => {
      await DatabaseService.delete('game_classes', classId)
      return classId
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games.all }),
    onError: (error) => {
      console.error('❌ Game class deletion failed:', error)
      throw error
    }
  })

  return { 
    createGameClass, 
    updateGameClass, 
    deleteGameClass,
    isCreating: createGameClass.isPending,
    isUpdating: updateGameClass.isPending,
    isDeleting: deleteGameClass.isPending
  }
}

// ============= Event Tracks Hook =============
export function useEventTracks(eventId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.eventTracks(eventId),
    queryFn: () => eventId ? DatabaseService.findMany<EventTrack>('event_tracks', {
      filters: [{ field: 'event_id', operator: 'eq', value: eventId }],
      sort: [{ field: 'stage_number', direction: 'asc' }]
    }) : [],
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  })
}