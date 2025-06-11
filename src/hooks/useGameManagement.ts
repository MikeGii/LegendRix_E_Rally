// src/hooks/useGameManagement.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Types
export interface Game {
  id: string
  name: string
  description?: string
  developer?: string
  platform?: string
  release_year?: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface GameType {
  id: string
  game_id: string
  name: string
  description?: string
  max_participants?: number
  min_participants?: number
  duration_type?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameEvent {
  id: string
  game_id: string
  name: string
  country?: string
  region?: string
  surface_type?: string
  weather_conditions?: string
  difficulty_level?: number
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  tracks?: EventTrack[]
}

export interface EventTrack {
  id: string
  event_id: string
  name: string
  length_km?: number
  stage_number?: number
  description?: string
  surface_type?: string
  is_special_stage: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GameClass {
  id: string
  game_id: string
  name: string
  description?: string
  skill_level?: string
  requirements?: string
  max_participants?: number
  entry_fee?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Query Keys
export const gameKeys = {
  all: ['games'] as const,
  games: () => [...gameKeys.all, 'list'] as const,
  types: (gameId?: string | null) => [...gameKeys.all, 'types', gameId] as const,
  events: (gameId?: string | null) => [...gameKeys.all, 'events', gameId] as const,
  classes: (gameId?: string | null) => [...gameKeys.all, 'classes', gameId] as const,
  tracks: (eventId?: string | null) => [...gameKeys.all, 'tracks', eventId] as const,
}

// Games Hook
export function useGames() {
  return useQuery({
    queryKey: gameKeys.games(),
    queryFn: async (): Promise<Game[]> => {
      console.log('🔄 Loading games...')
      
      const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading games:', error)
        throw error
      }

      console.log(`✅ Games loaded: ${games?.length || 0}`)
      return games || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Game Types Hook
export function useGameTypes(gameId?: string | null) {
  return useQuery({
    queryKey: gameKeys.types(gameId),
    queryFn: async (): Promise<GameType[]> => {
      if (!gameId) return []
      
      console.log('🔄 Loading game types for game:', gameId)
      
      const { data: types, error } = await supabase
        .from('game_types')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading game types:', error)
        throw error
      }

      console.log(`✅ Game types loaded: ${types?.length || 0}`)
      return types || []
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}

// Game Events Hook
export function useGameEvents(gameId?: string | null) {
  return useQuery({
    queryKey: gameKeys.events(gameId),
    queryFn: async (): Promise<GameEvent[]> => {
      if (!gameId) return []
      
      console.log('🔄 Loading game events for game:', gameId)
      
      const { data: events, error } = await supabase
        .from('game_events')
        .select(`
          *,
          tracks:event_tracks(*)
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading game events:', error)
        throw error
      }

      console.log(`✅ Game events loaded: ${events?.length || 0}`)
      return events || []
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}

// Game Classes Hook
export function useGameClasses(gameId?: string | null) {
  return useQuery({
    queryKey: gameKeys.classes(gameId),
    queryFn: async (): Promise<GameClass[]> => {
      if (!gameId) return []
      
      console.log('🔄 Loading game classes for game:', gameId)
      
      const { data: classes, error } = await supabase
        .from('game_classes')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading game classes:', error)
        throw error
      }

      console.log(`✅ Game classes loaded: ${classes?.length || 0}`)
      return classes || []
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}

// Event Tracks Hook
export function useEventTracks(eventId?: string | null) {
  return useQuery({
    queryKey: gameKeys.tracks(eventId),
    queryFn: async (): Promise<EventTrack[]> => {
      if (!eventId) return []
      
      console.log('🔄 Loading tracks for event:', eventId)
      
      const { data: tracks, error } = await supabase
        .from('event_tracks')
        .select('*')
        .eq('event_id', eventId)
        .order('stage_number', { ascending: true })

      if (error) {
        console.error('Error loading event tracks:', error)
        throw error
      }

      console.log(`✅ Event tracks loaded: ${tracks?.length || 0}`)
      return tracks || []
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  })
}

// Create Game Mutation
export function useCreateGame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gameData: Partial<Game>) => {
      console.log('🔄 Creating game:', gameData.name)
      
      const { data, error } = await supabase
        .from('games')
        .insert([{
          ...gameData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating game:', error)
        throw error
      }

      console.log('✅ Game created successfully:', data.name)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all })
    },
    onError: (error) => {
      console.error('❌ Game creation failed:', error)
    }
  })
}

// Create Game Type Mutation
export function useCreateGameType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (typeData: Partial<GameType>) => {
      console.log('🔄 Creating game type:', typeData.name)
      
      const { data, error } = await supabase
        .from('game_types')
        .insert([typeData])
        .select()
        .single()

      if (error) {
        console.error('Error creating game type:', error)
        throw error
      }

      console.log('✅ Game type created successfully:', data.name)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.types(data.game_id) })
    },
    onError: (error) => {
      console.error('❌ Game type creation failed:', error)
    }
  })
}

// Create Game Event Mutation
export function useCreateGameEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: Partial<GameEvent>) => {
      console.log('🔄 Creating game event:', eventData.name)
      
      const { data, error } = await supabase
        .from('game_events')
        .insert([eventData])
        .select()
        .single()

      if (error) {
        console.error('Error creating game event:', error)
        throw error
      }

      console.log('✅ Game event created successfully:', data.name)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.events(data.game_id) })
    },
    onError: (error) => {
      console.error('❌ Game event creation failed:', error)
    }
  })
}

// Create Game Class Mutation
export function useCreateGameClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (classData: Partial<GameClass>) => {
      console.log('🔄 Creating game class:', classData.name)
      
      const { data, error } = await supabase
        .from('game_classes')
        .insert([classData])
        .select()
        .single()

      if (error) {
        console.error('Error creating game class:', error)
        throw error
      }

      console.log('✅ Game class created successfully:', data.name)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.classes(data.game_id) })
    },
    onError: (error) => {
      console.error('❌ Game class creation failed:', error)
    }
  })
}

// Create Event Track Mutation
export function useCreateEventTrack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (trackData: Partial<EventTrack>) => {
      console.log('🔄 Creating event track:', trackData.name)
      
      const { data, error } = await supabase
        .from('event_tracks')
        .insert([trackData])
        .select()
        .single()

      if (error) {
        console.error('Error creating event track:', error)
        throw error
      }

      console.log('✅ Event track created successfully:', data.name)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.tracks(data.event_id) })
      // Also invalidate events to refresh track counts
      queryClient.invalidateQueries({ queryKey: gameKeys.all })
    },
    onError: (error) => {
      console.error('❌ Event track creation failed:', error)
    }
  })
}

// Delete Game Mutation
export function useDeleteGame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (gameId: string) => {
      console.log('🔄 Deleting game:', gameId)
      
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)

      if (error) {
        console.error('Error deleting game:', error)
        throw error
      }

      console.log('✅ Game deleted successfully')
      return gameId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all })
    },
    onError: (error) => {
      console.error('❌ Game deletion failed:', error)
    }
  })
}

// Update Game Mutation
export function useUpdateGame() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Game> & { id: string }) => {
      console.log('🔄 Updating game:', id)
      
      const { data, error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating game:', error)
        throw error
      }

      console.log('✅ Game updated successfully:', data.name)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all })
    },
    onError: (error) => {
      console.error('❌ Game update failed:', error)
    }
  })
}