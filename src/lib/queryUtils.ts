// src/lib/queryUtils.ts - Centralized query utilities and keys

import { supabase } from './supabase'
import type { QueryKeys, DatabaseTable, SortConfig, FilterConfig, ApiResponse } from '@/types'

// ============= Query Key Generators =============
export const createQueryKeys = (entity: string): QueryKeys => ({
  all: [entity] as const,
  lists: () => [...createQueryKeys(entity).all, 'list'] as const,
  list: (filters?: any) => [...createQueryKeys(entity).lists(), { filters }] as const,
  details: () => [...createQueryKeys(entity).all, 'detail'] as const,
  detail: (id: string) => [...createQueryKeys(entity).details(), id] as const,
})

// Centralized query keys
export const queryKeys = {
  users: createQueryKeys('users'),
  rallies: createQueryKeys('rallies'),
  games: createQueryKeys('games'),
  gameTypes: (gameId?: string) => ['games', 'types', gameId],
  gameEvents: (gameId?: string) => ['games', 'events', gameId],
  gameClasses: (gameId?: string) => ['games', 'classes', gameId],
  eventTracks: (eventId?: string) => ['events', 'tracks', eventId],
}

// ============= Generic Database Operations =============
export class DatabaseService {
  static async findMany<T>(
    table: DatabaseTable,
    options: {
      select?: string
      filters?: FilterConfig[]
      sort?: SortConfig[]
      limit?: number
      offset?: number
    } = {}
  ): Promise<T[]> {
    let query = supabase.from(table).select(options.select || '*')

    // Apply filters
    if (options.filters) {
      options.filters.forEach(filter => {
        query = query.filter(filter.field, filter.operator, filter.value)
      })
    }

    // Apply sorting
    if (options.sort) {
      options.sort.forEach(sort => {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' })
      })
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return (data as T[]) || []
  }

  static async findById<T>(table: DatabaseTable, id: string, select?: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as T | null
  }

  static async create<T>(table: DatabaseTable, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async update<T>(table: DatabaseTable, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  static async delete(table: DatabaseTable, id: string): Promise<void> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async count(table: DatabaseTable, filters?: FilterConfig[]): Promise<number> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })

    if (filters) {
      filters.forEach(filter => {
        query = query.filter(filter.field, filter.operator, filter.value)
      })
    }

    const { count, error } = await query
    if (error) throw error
    return count || 0
  }
}

// ============= Mutation Helpers =============
export const createMutationConfig = <T>(
  mutationFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    invalidateKeys?: string[][]
  } = {}
) => ({
  mutationFn,
  onSuccess: (data: T) => {
    if (options.onSuccess) options.onSuccess(data)
    // Auto-invalidate queries if keys provided
    if (options.invalidateKeys) {
      // This would need to be connected to React Query's queryClient
      console.log('Invalidating keys:', options.invalidateKeys)
    }
  },
  onError: (error: Error) => {
    console.error('Mutation error:', error)
    if (options.onError) options.onError(error)
  }
})

// ============= Common Query Options =============
export const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 1,
  refetchOnReconnect: true,
}

export const realtimeQueryOptions = {
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 30 * 1000,
  refetchOnWindowFocus: true,
  retry: 2,
}

// ============= Error Handling =============
export const handleQueryError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error)
  
  // Common error handling patterns
  if (error.code === 'PGRST116') {
    throw new Error('Record not found')
  }
  
  if (error.code === '23505') {
    throw new Error('Duplicate entry - record already exists')
  }
  
  if (error.code === '42501') {
    throw new Error('Insufficient permissions')
  }
  
  throw new Error(error.message || `${operation} failed`)
}

// ============= Data Transformation Helpers =============
export const transformRallyData = (rally: any) => {
  const now = new Date()
  const competitionDate = new Date(rally.competition_date)
  const registrationDeadline = new Date(rally.registration_deadline)
  
  return {
    ...rally,
    daysUntilEvent: Math.ceil((competitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    daysUntilRegistrationDeadline: Math.ceil((registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    canRegister: rally.status === 'registration_open' && registrationDeadline > now,
    registrationStatus: getRegistrationStatus(rally, now, registrationDeadline)
  }
}

const getRegistrationStatus = (rally: any, now: Date, deadline: Date) => {
  if (deadline <= now) return 'expired'
  if (rally.status !== 'registration_open') return 'closed'
  if (rally.max_participants && rally.registered_participants >= rally.max_participants) return 'full'
  return 'open'
}

// ============= Cache Management =============
export const getCacheKey = (entity: string, params?: Record<string, any>) => {
  if (!params) return [entity]
  return [entity, params]
}

export const invalidateRelatedQueries = (entity: string, id?: string) => {
  // This would connect to React Query's queryClient to invalidate related queries
  const keysToInvalidate = [
    [entity],
    id ? [entity, id] : null,
  ].filter(Boolean)
  
  console.log('Would invalidate keys:', keysToInvalidate)
  return keysToInvalidate
}