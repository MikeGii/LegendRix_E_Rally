// src/hooks/useCalendarEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface CalendarEvent {
  id: string
  event_date: string // ISO date string (YYYY-MM-DD)
  heading: string
  time: string // HH:MM format
  description?: string
  created_by?: string
  created_at: string
  updated_at: string
}

interface CreateEventInput {
  event_date: string
  heading: string
  time: string
  description?: string
}

// Query keys
export const calendarKeys = {
  all: ['calendar_events'] as const,
  lists: () => [...calendarKeys.all, 'list'] as const,
  list: (filters?: any) => [...calendarKeys.lists(), { filters }] as const,
  detail: (id: string) => [...calendarKeys.all, 'detail', id] as const,
}

// Fetch all calendar events
export function useCalendarEvents() {
  return useQuery({
    queryKey: calendarKeys.lists(),
    queryFn: async () => {
      console.log('📅 Fetching calendar events...')
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching calendar events:', error)
        throw error
      }

      console.log(`✅ Fetched ${data?.length || 0} calendar events`)
      return data as CalendarEvent[]
    },
    staleTime: 30000, // 30 seconds
  })
}

// Fetch events for specific month
export function useCalendarEventsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: [...calendarKeys.lists(), { year, month }],
    queryFn: async () => {
      console.log(`📅 Fetching events for ${year}-${month}...`)
      
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('event_date', startDate)
        .lte('event_date', endDate)
        .order('event_date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching calendar events:', error)
        throw error
      }

      console.log(`✅ Fetched ${data?.length || 0} events for ${year}-${month}`)
      return data as CalendarEvent[]
    },
    staleTime: 30000,
  })
}

// Create calendar event
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: CreateEventInput) => {
      console.log('📅 Creating calendar event:', eventData)

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          ...eventData,
          created_by: user.id,
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating calendar event:', error)
        throw error
      }

      console.log('✅ Calendar event created:', data.heading)
      return data as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

// Update calendar event
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<CalendarEvent> & { id: string }) => {
      console.log('📅 Updating calendar event:', id)

      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating calendar event:', error)
        throw error
      }

      console.log('✅ Calendar event updated:', data.heading)
      return data as CalendarEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

// Delete calendar event
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      console.log('📅 Deleting calendar event:', eventId)

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)

      if (error) {
        console.error('Error deleting calendar event:', error)
        throw error
      }

      console.log('✅ Calendar event deleted')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}