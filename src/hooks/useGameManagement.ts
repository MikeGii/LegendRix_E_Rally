// src/hooks/useGameManagement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Game, GameType, GameEvent, EventTrack, GameClass } from '@/types'

// Query Keys
export const gameKeys = {
  all: ['games'] as const,
  games: () => [...gameKeys.all, 'list'] as const,
  game: (id: string) => [...gameKeys.all, 'detail', id] as const,
  gameTypes: (gameId?: string) => ['game-types', gameId] as const,
  gameEvents: (gameId?: string) => ['game-events', gameId] as const,
  gameClasses: (gameId?: string) => ['game-classes', gameId] as const,
  eventTracks: (eventId?: string) => ['event-tracks', eventId] as const,
}

// ============= GAMES HOOKS =============

export function useGames() {
  return useQuery({
    queryKey: gameKeys.games(),
    queryFn: async (): Promise<Game[]> => {
      console.log('🔄 Loading games...')
      
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error loading games:', error)
        throw error
      }

      console.log(`✅ Games loaded: ${games?.length || 0}`)
      return games || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (gameData: { name: string; description?: string }) => {
      console.log('🔄 Creating game:', gameData.name)
      
      // Get current user session
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 Current user for game creation:', user?.email)
      
      const { data, error } = await supabase
        .from('games')
        .insert([{
          name: gameData.name.trim(),
          description: gameData.description?.trim() || null,
          is_active: true,
          created_by: user?.id || '026ecbe6-6741-4c17-a93d-760ea15d02df' // Fallback to your admin ID
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating game:', error)
        throw error
      }

      console.log('✅ Game created:', data.name)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.games() })
    }
  })
}

export function useUpdateGame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...gameData }: { id: string; name: string; description?: string }) => {
      console.log('🔄 Updating game:', id)
      
      const { data, error } = await supabase
        .from('games')
        .update({
          name: gameData.name.trim(),
          description: gameData.description?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating game:', error)
        throw error
      }

      console.log('✅ Game updated:', data.name)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.games() })
    }
  })
}

export function useDeleteGame() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (gameId: string) => {
      console.log('🔄 Deleting game and all related data:', gameId)
      
      // Delete all related data in correct order (due to foreign key constraints)
      // 1. Delete event tracks first
      const { error: tracksError } = await supabase
        .from('event_tracks')
        .delete()
        .in('event_id', 
          await supabase
            .from('game_events')
            .select('id')
            .eq('game_id', gameId)
            .then(({ data }) => data?.map(e => e.id) || [])
        )

      if (tracksError) {
        console.error('Error deleting event tracks:', tracksError)
        throw tracksError
      }

      // 2. Delete game events
      const { error: eventsError } = await supabase
        .from('game_events')
        .delete()
        .eq('game_id', gameId)

      if (eventsError) {
        console.error('Error deleting game events:', eventsError)
        throw eventsError
      }

      // 3. Delete game types
      const { error: typesError } = await supabase
        .from('game_types')
        .delete()
        .eq('game_id', gameId)

      if (typesError) {
        console.error('Error deleting game types:', typesError)
        throw typesError
      }

      // 4. Delete game classes
      const { error: classesError } = await supabase
        .from('game_classes')
        .delete()
        .eq('game_id', gameId)

      if (classesError) {
        console.error('Error deleting game classes:', classesError)
        throw classesError
      }

      // 5. Finally delete the game itself
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (gameError) {
        console.error('Error deleting game:', gameError)
        throw gameError
      }

      console.log('✅ Game and all related data deleted')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.games() })
      queryClient.invalidateQueries({ queryKey: ['game-types'] })
      queryClient.invalidateQueries({ queryKey: ['game-events'] })
      queryClient.invalidateQueries({ queryKey: ['game-classes'] })
      queryClient.invalidateQueries({ queryKey: ['event-tracks'] })
    }
  })
}

// ============= GAME TYPES HOOKS =============

export function useGameTypes(gameId?: string) {
  return useQuery({
    queryKey: gameKeys.gameTypes(gameId),
    queryFn: async (): Promise<GameType[]> => {
      if (!gameId) return []
      
      console.log('🔄 Loading game types for game:', gameId)
      
      const { data: gameTypes, error } = await supabase
        .from('game_types')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error loading game types:', error)
        throw error
      }

      console.log(`✅ Game types loaded: ${gameTypes?.length || 0}`)
      return gameTypes || []
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGameType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (typeData: { game_id: string; name: string }) => {
      console.log('🔄 Creating game type:', typeData.name)
      
      const { data, error } = await supabase
        .from('game_types')
        .insert([{
          game_id: typeData.game_id,
          name: typeData.name.trim(),
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating game type:', error)
        throw error
      }

      console.log('✅ Game type created:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameTypes(variables.game_id) })
    }
  })
}

export function useUpdateGameType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, game_id, name }: { id: string; game_id: string; name: string }) => {
      console.log('🔄 Updating game type:', id)
      
      const { data, error } = await supabase
        .from('game_types')
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating game type:', error)
        throw error
      }

      console.log('✅ Game type updated:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameTypes(variables.game_id) })
    }
  })
}

export function useDeleteGameType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, game_id }: { id: string; game_id: string }) => {
      console.log('🔄 Deleting game type:', id)
      
      const { error } = await supabase
        .from('game_types')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting game type:', error)
        throw error
      }

      console.log('✅ Game type deleted')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameTypes(variables.game_id) })
    }
  })
}

// ============= GAME EVENTS HOOKS =============

export function useGameEvents(gameId?: string) {
  return useQuery({
    queryKey: gameKeys.gameEvents(gameId),
    queryFn: async (): Promise<GameEvent[]> => {
      if (!gameId) return []
      
      console.log('🔄 Loading game events for game:', gameId)
      
      const { data: gameEvents, error } = await supabase
        .from('game_events')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error loading game events:', error)
        throw error
      }

      console.log(`✅ Game events loaded: ${gameEvents?.length || 0}`)
      return gameEvents || []
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGameEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventData: { game_id: string; name: string }) => {
      console.log('🔄 Creating game event:', eventData.name)
      
      const { data, error } = await supabase
        .from('game_events')
        .insert([{
          game_id: eventData.game_id,
          name: eventData.name.trim(),
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating game event:', error)
        throw error
      }

      console.log('✅ Game event created:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameEvents(variables.game_id) })
    }
  })
}

export function useUpdateGameEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, game_id, name }: { id: string; game_id: string; name: string }) => {
      console.log('🔄 Updating game event:', id)
      
      const { data, error } = await supabase
        .from('game_events')
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating game event:', error)
        throw error
      }

      console.log('✅ Game event updated:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameEvents(variables.game_id) })
    }
  })
}

export function useDeleteGameEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, game_id }: { id: string; game_id: string }) => {
      console.log('🔄 Deleting game event and tracks:', id)
      
      // First delete all tracks for this event
      const { error: tracksError } = await supabase
        .from('event_tracks')
        .delete()
        .eq('event_id', id)

      if (tracksError) {
        console.error('Error deleting event tracks:', tracksError)
        throw tracksError
      }

      // Then delete the event
      const { error: eventError } = await supabase
        .from('game_events')
        .delete()
        .eq('id', id)

      if (eventError) {
        console.error('Error deleting game event:', eventError)
        throw eventError
      }

      console.log('✅ Game event and tracks deleted')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameEvents(variables.game_id) })
      queryClient.invalidateQueries({ queryKey: ['event-tracks'] })
    }
  })
}

// ============= EVENT TRACKS HOOKS =============

export function useEventTracks(eventId?: string) {
  return useQuery({
    queryKey: gameKeys.eventTracks(eventId),
    queryFn: async (): Promise<EventTrack[]> => {
      if (!eventId) return []
      
      console.log('🔄 Loading event tracks for event:', eventId)
      
      const { data: eventTracks, error } = await supabase
        .from('event_tracks')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error loading event tracks:', error)
        throw error
      }

      console.log(`✅ Event tracks loaded: ${eventTracks?.length || 0}`)
      return eventTracks || []
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateEventTrack() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (trackData: { 
      event_id: string; 
      name: string; 
      surface_type: string; 
      length_km?: number 
    }) => {
      console.log('🔄 Creating event track:', trackData.name)
      
      const { data, error } = await supabase
        .from('event_tracks')
        .insert([{
          event_id: trackData.event_id,
          name: trackData.name.trim(),
          surface_type: trackData.surface_type,
          length_km: trackData.length_km || null,
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating event track:', error)
        throw error
      }

      console.log('✅ Event track created:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.eventTracks(variables.event_id) })
    }
  })
}

export function useUpdateEventTrack() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      event_id, 
      name, 
      surface_type, 
      length_km 
    }: { 
      id: string; 
      event_id: string; 
      name: string; 
      surface_type: string; 
      length_km?: number 
    }) => {
      console.log('🔄 Updating event track:', id)
      
      const { data, error } = await supabase
        .from('event_tracks')
        .update({
          name: name.trim(),
          surface_type,
          length_km: length_km || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating event track:', error)
        throw error
      }

      console.log('✅ Event track updated:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.eventTracks(variables.event_id) })
    }
  })
}

export function useDeleteEventTrack() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, event_id }: { id: string; event_id: string }) => {
      console.log('🔄 Deleting event track:', id)
      
      const { error } = await supabase
        .from('event_tracks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting event track:', error)
        throw error
      }

      console.log('✅ Event track deleted')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.eventTracks(variables.event_id) })
    }
  })
}

// ============= GAME CLASSES HOOKS =============

export function useGameClasses(gameId?: string) {
  return useQuery({
    queryKey: gameKeys.gameClasses(gameId),
    queryFn: async (): Promise<GameClass[]> => {
      if (!gameId) return []
      
      console.log('🔄 Loading game classes for game:', gameId)
      
      const { data: gameClasses, error } = await supabase
        .from('game_classes')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error loading game classes:', error)
        throw error
      }

      console.log(`✅ Game classes loaded: ${gameClasses?.length || 0}`)
      return gameClasses || []
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGameClass() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (classData: { game_id: string; name: string }) => {
      console.log('🔄 Creating game class:', classData.name)
      
      const { data, error } = await supabase
        .from('game_classes')
        .insert([{
          game_id: classData.game_id,
          name: classData.name.trim(),
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating game class:', error)
        throw error
      }

      console.log('✅ Game class created:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameClasses(variables.game_id) })
    }
  })
}

export function useUpdateGameClass() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, game_id, name }: { id: string; game_id: string; name: string }) => {
      console.log('🔄 Updating game class:', id)
      
      const { data, error } = await supabase
        .from('game_classes')
        .update({
          name: name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating game class:', error)
        throw error
      }

      console.log('✅ Game class updated:', data.name)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameClasses(variables.game_id) })
    }
  })
}

export function useDeleteGameClass() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, game_id }: { id: string; game_id: string }) => {
      console.log('🔄 Deleting game class:', id)
      
      const { error } = await supabase
        .from('game_classes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting game class:', error)
        throw error
      }

      console.log('✅ Game class deleted')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.gameClasses(variables.game_id) })
    }
  })
}