// src/hooks/useData.ts - Unified data management hook

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DatabaseService, queryKeys, defaultQueryOptions, handleQueryError } from '@/lib/queryUtils'
import type { User, Rally, Game, GameType, GameEvent, GameClass, UserStats, FilterConfig, SortConfig, DatabaseTable } from '@/types'

// ============= Generic Data Hook =============
export function useData<T>(
  entity: string,
  options: {
    filters?: FilterConfig[]
    sort?: SortConfig[]
    limit?: number
    select?: string
    enabled?: boolean
  } = {}
) {
  return useQuery({
    queryKey: [entity, options],
    queryFn: () => DatabaseService.findMany<T>(entity as DatabaseTable, options),
    enabled: options.enabled !== false,
    ...defaultQueryOptions,
  })
}

// ============= User Management =============
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: async (): Promise<User[]> => {
      try {
        return await DatabaseService.findMany<User>('users', {
          select: 'id, name, email, role, created_at, last_login, email_verified, admin_approved, status',
          sort: [{ field: 'created_at', direction: 'desc' }]
        })
      } catch (error) {
        throw handleQueryError(error, 'Load users')
      }
    },
    ...defaultQueryOptions,
  })
}

export function useUserStats() {
  const { data: users = [] } = useUsers()
  
  return {
    totalUsers: users.length,
    pendingEmail: users.filter(u => u.status === 'pending_email').length,
    pendingApproval: users.filter(u => u.status === 'pending_approval' && u.email_verified && !u.admin_approved).length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length
  } as UserStats
}

export function useUserMutations() {
  const queryClient = useQueryClient()

  const invalidateUsers = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
  }

  const approveUser = useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: 'approve' | 'reject'; reason?: string }) => {
      const updates = {
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_approved: action === 'approve',
        updated_at: new Date().toISOString()
      }
      
      await DatabaseService.update('users', userId, updates)
      
      // Send notification (fire and forget)
      fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, reason })
      }).catch(console.warn)
      
      return { userId, action }
    },
    onSuccess: invalidateUsers
  })

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }
      
      return response.json()
    },
    onSuccess: invalidateUsers
  })

  const promoteUser = useMutation({
    mutationFn: async (userId: string) => {
      return DatabaseService.update('users', userId, {
        role: 'admin',
        admin_approved: true,
        status: 'approved',
        updated_at: new Date().toISOString()
      })
    },
    onSuccess: invalidateUsers
  })

  return { approveUser, deleteUser, promoteUser }
}

// ============= Game Management =============
export function useGames() {
  return useQuery({
    queryKey: queryKeys.games.lists(),
    queryFn: () => DatabaseService.findMany<Game>('games', {
      sort: [{ field: 'created_at', direction: 'desc' }]
    }),
    ...defaultQueryOptions,
  })
}

export function useGameTypes(gameId?: string) {
  return useQuery({
    queryKey: queryKeys.gameTypes(gameId),
    queryFn: () => gameId ? DatabaseService.findMany<GameType>('game_types', {
      filters: [{ field: 'game_id', operator: 'eq', value: gameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!gameId,
    ...defaultQueryOptions,
  })
}

export function useGameEvents(gameId?: string) {
  return useQuery({
    queryKey: queryKeys.gameEvents(gameId),
    queryFn: () => gameId ? DatabaseService.findMany<GameEvent>('game_events', {
      filters: [{ field: 'game_id', operator: 'eq', value: gameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!gameId,
    ...defaultQueryOptions,
  })
}

export function useGameClasses(gameId?: string) {
  return useQuery({
    queryKey: queryKeys.gameClasses(gameId),
    queryFn: () => gameId ? DatabaseService.findMany<GameClass>('game_classes', {
      filters: [{ field: 'game_id', operator: 'eq', value: gameId }],
      sort: [{ field: 'created_at', direction: 'desc' }]
    }) : [],
    enabled: !!gameId,
    ...defaultQueryOptions,
  })
}

export function useGameMutations() {
  const queryClient = useQueryClient()

  const invalidateGames = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.games.all })
  }

  const createGame = useMutation({
    mutationFn: (gameData: Partial<Game>) => DatabaseService.create<Game>('games', gameData),
    onSuccess: invalidateGames
  })

  const updateGame = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Game> & { id: string }) => 
      DatabaseService.update<Game>('games', id, updates),
    onSuccess: invalidateGames
  })

  const deleteGame = useMutation({
    mutationFn: (gameId: string) => DatabaseService.delete('games', gameId),
    onSuccess: invalidateGames
  })

  return { createGame, updateGame, deleteGame }
}

// ============= Rally Management =============
export function useRallies() {
  return useQuery({
    queryKey: queryKeys.rallies.lists(),
    queryFn: () => DatabaseService.findMany<Rally>('rally_details', {
      sort: [{ field: 'competition_date', direction: 'desc' }]
    }),
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpcomingRallies(limit: number = 10) {
  return useQuery({
    queryKey: ['rallies', 'upcoming', { limit }],
    queryFn: () => DatabaseService.findMany<Rally>('rally_details', {
      filters: [
        { field: 'is_active', operator: 'eq', value: true },
        { field: 'status', operator: 'in', value: ['upcoming', 'registration_open'] },
        { field: 'competition_date', operator: 'gte', value: new Date().toISOString() }
      ],
      sort: [{ field: 'competition_date', direction: 'asc' }],
      limit
    }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeaturedRallies(limit: number = 3) {
  return useQuery({
    queryKey: ['rallies', 'featured', { limit }],
    queryFn: () => DatabaseService.findMany<Rally>('rally_details', {
      filters: [
        { field: 'is_active', operator: 'eq', value: true },
        { field: 'is_featured', operator: 'eq', value: true },
        { field: 'status', operator: 'in', value: ['upcoming', 'registration_open'] },
        { field: 'competition_date', operator: 'gte', value: new Date().toISOString() }
      ],
      sort: [{ field: 'competition_date', direction: 'asc' }],
      limit
    }),
    staleTime: 5 * 60 * 1000,
  })
}

// ============= Generic Mutations =============
export function useGenericMutations<T extends { id: string }>(entity: string) {
  const queryClient = useQueryClient()

  const invalidateEntity = () => {
    queryClient.invalidateQueries({ queryKey: [entity] })
  }

  const create = useMutation({
    mutationFn: (data: Partial<T>) => DatabaseService.create<T>(entity as DatabaseTable, data),
    onSuccess: invalidateEntity
  })

  const update = useMutation({
    mutationFn: ({ id, ...updates }: Partial<T> & { id: string }) => 
      DatabaseService.update<T>(entity as DatabaseTable, id, updates as Partial<T>),
    onSuccess: invalidateEntity
  })

  const remove = useMutation({
    mutationFn: (id: string) => DatabaseService.delete(entity as DatabaseTable, id),
    onSuccess: invalidateEntity
  })

  return { create, update, remove, invalidate: invalidateEntity }
}