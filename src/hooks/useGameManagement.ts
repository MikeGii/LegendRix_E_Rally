// src/hooks/useGameManagement.ts - COMPLETE FIXED VERSION

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DatabaseService, queryKeys, handleQueryError } from '@/lib/queryUtils'
import type { Game, GameType, GameEvent, GameClass, EventTrack } from '@/types'

// ============= Main Hook - Centralized Data Management =============
export function useGameManagement(selectedGameId?: string) {
  // Base queries
  const gamesQuery = useQuery({
    queryKey: queryKeys.games.lists(),
    queryFn: () => DatabaseService.findMany<Game>('games', {
      sort: [{ field: 'created_at', direction: 'desc' }]
    }),
    staleTime: 5 * 60 * 1000,
  })

  const gameTypesQuery = useQuery({
    queryKey: queryKeys.gameTypes(selectedGameId),
    queryFn: () => selectedGameId ? DatabaseService.findMany<GameType>('game_types', {
      filters: [{ field: 'game_id', operator: 'eq', value: selectedGameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!selectedGameId,
    staleTime: 5 * 60 * 1000,
  })

  const gameEventsQuery = useQuery({
    queryKey: queryKeys.gameEvents(selectedGameId),
    queryFn: () => selectedGameId ? DatabaseService.findMany<GameEvent>('game_events', {
      filters: [{ field: 'game_id', operator: 'eq', value: selectedGameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!selectedGameId,
    staleTime: 5 * 60 * 1000,
  })

  const gameClassesQuery = useQuery({
    queryKey: queryKeys.gameClasses(selectedGameId),
    queryFn: () => selectedGameId ? DatabaseService.findMany<GameClass>('game_classes', {
      filters: [{ field: 'game_id', operator: 'eq', value: selectedGameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!selectedGameId,
    staleTime: 5 * 60 * 1000,
  })

  // Unified refetch
  const refetch = () => {
    gamesQuery.refetch()
    if (selectedGameId) {
      gameTypesQuery.refetch()
      gameEventsQuery.refetch()
      gameClassesQuery.refetch()
    }
  }

  return {
    games: gamesQuery.data || [],
    gameTypes: gameTypesQuery.data || [],
    gameEvents: gameEventsQuery.data || [],
    gameClasses: gameClassesQuery.data || [],
    isLoading: gamesQuery.isLoading || 
               (selectedGameId && (gameTypesQuery.isLoading || gameEventsQuery.isLoading || gameClassesQuery.isLoading)),
    error: gamesQuery.error || gameTypesQuery.error || gameEventsQuery.error || gameClassesQuery.error,
    refetch
  }
}

// ============= Event Tracks Hook =============
export function useEventTracks(eventId?: string) {
  return useQuery({
    queryKey: queryKeys.eventTracks(eventId),
    queryFn: () => eventId ? DatabaseService.findMany<EventTrack>('event_tracks', {
      filters: [{ field: 'event_id', operator: 'eq', value: eventId }],
      sort: [{ field: 'stage_number', direction: 'asc' }]
    }) : [],
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  })
}

// ============= Game Mutations =============
export function useGameMutations() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
  }

  const createGame = useMutation({
    mutationFn: async (gameData: Partial<Game>) => {
      try {
        const result = await DatabaseService.create<Game>('games', {
          ...gameData,
          is_active: true
        })
        return result
      } catch (error) {
        throw handleQueryError(error, 'Create game')
      }
    },
    onSuccess: invalidateAll,
    onError: (error) => console.error('❌ Game creation failed:', error)
  })

  const updateGame = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Game> & { id: string }) => {
      try {
        return await DatabaseService.update<Game>('games', id, updates)
      } catch (error) {
        throw handleQueryError(error, 'Update game')
      }
    },
    onSuccess: invalidateAll,
    onError: (error) => console.error('❌ Game update failed:', error)
  })

  const deleteGame = useMutation({
    mutationFn: async (gameId: string) => {
      try {
        await DatabaseService.delete('games', gameId)
        return gameId
      } catch (error) {
        throw handleQueryError(error, 'Delete game')
      }
    },
    onSuccess: invalidateAll,
    onError: (error) => console.error('❌ Game deletion failed:', error)
  })

  return { createGame, updateGame, deleteGame }
}

// ============= Game Type Mutations =============
export function useGameTypeMutations() {
  const queryClient = useQueryClient()

  const invalidateTypes = (gameId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gameTypes(gameId) })
  }

  const createGameType = useMutation({
    mutationFn: async (typeData: Partial<GameType>) => {
      try {
        return await DatabaseService.create<GameType>('game_types', {
          ...typeData,
          is_active: true,
          min_participants: 1
        })
      } catch (error) {
        throw handleQueryError(error, 'Create game type')
      }
    },
    onSuccess: (data) => invalidateTypes(data.game_id),
    onError: (error) => console.error('❌ Game type creation failed:', error)
  })

  const updateGameType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameType> & { id: string }) => {
      try {
        return await DatabaseService.update<GameType>('game_types', id, updates)
      } catch (error) {
        throw handleQueryError(error, 'Update game type')
      }
    },
    onSuccess: (data) => invalidateTypes(data.game_id),
    onError: (error) => console.error('❌ Game type update failed:', error)
  })

  const deleteGameType = useMutation({
    mutationFn: async (typeId: string) => {
      try {
        await DatabaseService.delete('game_types', typeId)
        return typeId
      } catch (error) {
        throw handleQueryError(error, 'Delete game type')
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
    onError: (error) => console.error('❌ Game type deletion failed:', error)
  })

  return { createGameType, updateGameType, deleteGameType }
}

// ============= Game Event Mutations =============
export function useGameEventMutations() {
  const queryClient = useQueryClient()

  const invalidateEvents = (gameId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gameEvents(gameId) })
  }

  const createGameEvent = useMutation({
    mutationFn: async (eventData: Partial<GameEvent>) => {
      try {
        return await DatabaseService.create<GameEvent>('game_events', {
          ...eventData,
          is_active: true
        })
      } catch (error) {
        throw handleQueryError(error, 'Create game event')
      }
    },
    onSuccess: (data) => invalidateEvents(data.game_id),
    onError: (error) => console.error('❌ Game event creation failed:', error)
  })

  const updateGameEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameEvent> & { id: string }) => {
      try {
        return await DatabaseService.update<GameEvent>('game_events', id, updates)
      } catch (error) {
        throw handleQueryError(error, 'Update game event')
      }
    },
    onSuccess: (data) => invalidateEvents(data.game_id),
    onError: (error) => console.error('❌ Game event update failed:', error)
  })

  const deleteGameEvent = useMutation({
    mutationFn: async (eventId: string) => {
      try {
        await DatabaseService.delete('game_events', eventId)
        return eventId
      } catch (error) {
        throw handleQueryError(error, 'Delete game event')
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
    onError: (error) => console.error('❌ Game event deletion failed:', error)
  })

  return { createGameEvent, updateGameEvent, deleteGameEvent }
}

// ============= Game Class Mutations =============
export function useGameClassMutations() {
  const queryClient = useQueryClient()

  const invalidateClasses = (gameId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gameClasses(gameId) })
  }

  const createGameClass = useMutation({
    mutationFn: async (classData: Partial<GameClass>) => {
      try {
        return await DatabaseService.create<GameClass>('game_classes', {
          ...classData,
          is_active: true,
          skill_level: 'intermediate'
        })
      } catch (error) {
        throw handleQueryError(error, 'Create game class')
      }
    },
    onSuccess: (data) => invalidateClasses(data.game_id),
    onError: (error) => console.error('❌ Game class creation failed:', error)
  })

  const updateGameClass = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameClass> & { id: string }) => {
      try {
        return await DatabaseService.update<GameClass>('game_classes', id, updates)
      } catch (error) {
        throw handleQueryError(error, 'Update game class')
      }
    },
    onSuccess: (data) => invalidateClasses(data.game_id),
    onError: (error) => console.error('❌ Game class update failed:', error)
  })

  const deleteGameClass = useMutation({
    mutationFn: async (classId: string) => {
      try {
        await DatabaseService.delete('game_classes', classId)
        return classId
      } catch (error) {
        throw handleQueryError(error, 'Delete game class')
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
    onError: (error) => console.error('❌ Game class deletion failed:', error)
  })

  return { createGameClass, updateGameClass, deleteGameClass }
}

// ============= Event Track Mutations =============
export function useEventTrackMutations() {
  const queryClient = useQueryClient()

  const invalidateTracks = (eventId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.eventTracks(eventId) })
  }

  const createEventTrack = useMutation({
    mutationFn: async (trackData: Partial<EventTrack>) => {
      try {
        return await DatabaseService.create<EventTrack>('event_tracks', {
          ...trackData,
          is_active: true,
          is_special_stage: trackData.is_special_stage || false
        })
      } catch (error) {
        throw handleQueryError(error, 'Create event track')
      }
    },
    onSuccess: (data) => {
      invalidateTracks(data.event_id)
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
    },
    onError: (error) => console.error('❌ Event track creation failed:', error)
  })

  const updateEventTrack = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventTrack> & { id: string }) => {
      try {
        return await DatabaseService.update<EventTrack>('event_tracks', id, updates)
      } catch (error) {
        throw handleQueryError(error, 'Update event track')
      }
    },
    onSuccess: (data) => {
      invalidateTracks(data.event_id)
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
    },
    onError: (error) => console.error('❌ Event track update failed:', error)
  })

  const deleteEventTrack = useMutation({
    mutationFn: async (trackId: string) => {
      try {
        await DatabaseService.delete('event_tracks', trackId)
        return trackId
      } catch (error) {
        throw handleQueryError(error, 'Delete event track')
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.games.all }),
    onError: (error) => console.error('❌ Event track deletion failed:', error)
  })

  return { createEventTrack, updateEventTrack, deleteEventTrack }
}