// src/hooks/useGenerationHistory.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

interface SaveGenerationParams {
  gameId: string
  gameName: string
  eventCount: number
  trackCountPerEvent: number
  totalTracks: number
  minTrackLength: number
  maxTrackLength: number
  selectedEvents: Array<{ event_id: string; event_name: string }>
  selectedTracks: Array<{
    track_id: string
    track_name: string
    event_name: string
    length_km: number
  }>
}

export function useSaveGenerationHistory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: SaveGenerationParams) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('rally_generation_history')
        .insert({
          user_id: user.id,
          game_id: params.gameId,
          game_name: params.gameName,
          event_count: params.eventCount,
          track_count_per_event: params.trackCountPerEvent,
          total_tracks: params.totalTracks,
          min_track_length: params.minTrackLength,
          max_track_length: params.maxTrackLength,
          selected_events: params.selectedEvents,
          selected_tracks: params.selectedTracks
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch generation history
      queryClient.invalidateQueries({ queryKey: ['generation-history'] })
    }
  })
}