// src/hooks/useRallyLinking.ts - Hooks for linking events, tracks, and classes to rallies
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { rallyManagementKeys } from './useRallyManagement'

// ============================================================================
// RALLY EVENTS LINKING
// ============================================================================

export function useCreateRallyEvents() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rallyId: string
      events: string[]
      pointsMultiplier?: number
    }) => {
      console.log('🔄 Creating rally events:', params)
      
      const { rallyId, events, pointsMultiplier = 1.0 } = params
      
      // Create rally_events entries
      const rallyEventsData = events.map((eventId, index) => ({
        rally_id: rallyId,
        event_id: eventId,
        event_order: index + 1,
        points_multiplier: pointsMultiplier,
        is_active: true
      }))

      const { data, error } = await supabase
        .from('rally_events')
        .insert(rallyEventsData)
        .select()

      if (error) {
        console.error('Error creating rally events:', error)
        throw error
      }

      console.log(`✅ Rally events created: ${data.length}`)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.events(variables.rallyId) })
    }
  })
}

// ============================================================================
// RALLY EVENT TRACKS LINKING
// ============================================================================

export function useCreateRallyEventTracks() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rallyId: string
      rallyEventId: string
      tracks: string[]
      pointsWeight?: number
    }) => {
      console.log('🔄 Creating rally event tracks:', params)
      
      const { rallyEventId, tracks, pointsWeight = 1.0 } = params
      
      // Create rally_event_tracks entries
      const rallyEventTracksData = tracks.map((trackId, index) => ({
        rally_event_id: rallyEventId,
        track_id: trackId,
        track_order: index + 1,
        points_weight: pointsWeight,
        is_active: true
      }))

      const { data, error } = await supabase
        .from('rally_event_tracks')
        .insert(rallyEventTracksData)
        .select()

      if (error) {
        console.error('Error creating rally event tracks:', error)
        throw error
      }

      console.log(`✅ Rally event tracks created: ${data.length}`)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.events(variables.rallyId) })
    }
  })
}

// ============================================================================
// RALLY CLASSES LINKING
// ============================================================================

export function useCreateRallyClasses() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (params: {
      rallyId: string
      classes: string[]
      maxParticipants?: number
      entryFeeModifier?: number
    }) => {
      console.log('🔄 Creating rally classes:', params)
      
      const { rallyId, classes, maxParticipants, entryFeeModifier = 1.0 } = params
      
      // Create rally_classes entries
      const rallyClassesData = classes.map(classId => ({
        rally_id: rallyId,
        class_id: classId,
        max_participants: maxParticipants?.toString(),
        entry_fee_modifier: entryFeeModifier,
        is_active: true
      }))

      const { data, error } = await supabase
        .from('rally_classes')
        .insert(rallyClassesData)
        .select()

      if (error) {
        console.error('Error creating rally classes:', error)
        throw error
      }

      console.log(`✅ Rally classes created: ${data.length}`)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rallyManagementKeys.classes(variables.rallyId) })
    }
  })
}

// ============================================================================
// COMBINED RALLY SETUP FUNCTION
// ============================================================================

export function useCompleteRallySetup() {
  const createRallyEvents = useCreateRallyEvents()
  const createRallyEventTracks = useCreateRallyEventTracks()
  const createRallyClasses = useCreateRallyClasses()
  
  return useMutation({
    mutationFn: async (params: {
      rallyId: string
      selectedEvents: string[]
      selectedTracks: { [eventId: string]: string[] }
      selectedClasses: string[]
    }) => {
      console.log('🔄 Setting up complete rally structure:', params)
      
      const { rallyId, selectedEvents, selectedTracks, selectedClasses } = params
      
      // Step 1: Create rally events
      let rallyEventsData: any[] = []
      if (selectedEvents.length > 0) {
        rallyEventsData = await createRallyEvents.mutateAsync({
          rallyId,
          events: selectedEvents
        })
      }

      // Step 2: Create rally event tracks for each event
      const trackPromises: Promise<any>[] = []
      for (const rallyEvent of rallyEventsData) {
        const eventTracks = selectedTracks[rallyEvent.event_id]
        if (eventTracks && eventTracks.length > 0) {
          trackPromises.push(
            createRallyEventTracks.mutateAsync({
              rallyId,
              rallyEventId: rallyEvent.id,
              tracks: eventTracks
            })
          )
        }
      }
      
      const trackResults = await Promise.all(trackPromises)

      // Step 3: Create rally classes
      let rallyClassesData: any[] = []
      if (selectedClasses.length > 0) {
        rallyClassesData = await createRallyClasses.mutateAsync({
          rallyId,
          classes: selectedClasses
        })
      }

      console.log('✅ Complete rally setup finished:', {
        events: rallyEventsData.length,
        tracks: trackResults.reduce((sum, tracks) => sum + tracks.length, 0),
        classes: rallyClassesData.length
      })

      return {
        events: rallyEventsData,
        tracks: trackResults,
        classes: rallyClassesData
      }
    }
  })
}