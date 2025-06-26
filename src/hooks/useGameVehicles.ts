// src/hooks/useGameVehicles.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Types
export interface GameVehicle {
  id: string
  vehicle_name: string
  game_id: string
  created_at: string
  updated_at: string
}

export interface CreateVehicleInput {
  vehicle_name: string
  game_id: string
}

export interface UpdateVehicleInput {
  id: string
  vehicle_name: string
}

// Query keys
export const vehicleKeys = {
  all: ['game-vehicles'] as const,
  byGame: (gameId: string) => [...vehicleKeys.all, 'game', gameId] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
}

// Hook to fetch all vehicles for a specific game
export function useGameVehicles(gameId: string) {
  return useQuery({
    queryKey: vehicleKeys.byGame(gameId),
    queryFn: async () => {
      if (!gameId) return []
      
      const { data, error } = await supabase
        .from('game_vehicles')
        .select('*')
        .eq('game_id', gameId)
        .order('vehicle_name', { ascending: true })

      if (error) {
        console.error('Error fetching game vehicles:', error)
        throw error
      }

      return data as GameVehicle[]
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch all vehicles (for team selection)
export function useAllGameVehicles() {
  return useQuery({
    queryKey: vehicleKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_vehicles')
        .select(`
          *,
          game:games(name)
        `)
        .order('game_id', { ascending: true })
        .order('vehicle_name', { ascending: true })

      if (error) {
        console.error('Error fetching all vehicles:', error)
        throw error
      }

      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to create a new vehicle
export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateVehicleInput) => {
      // Check if vehicle already exists for this game
      const { data: existing } = await supabase
        .from('game_vehicles')
        .select('id')
        .eq('vehicle_name', input.vehicle_name)
        .eq('game_id', input.game_id)
        .single()

      if (existing) {
        throw new Error('Selle nimega sõiduk on selles mängus juba olemas')
      }

      const { data, error } = await supabase
        .from('game_vehicles')
        .insert([{
          vehicle_name: input.vehicle_name.trim(),
          game_id: input.game_id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating vehicle:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate and refetch vehicle queries
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byGame(data.game_id) })
    },
  })
}

// Hook to update a vehicle
export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateVehicleInput) => {
      const { data, error } = await supabase
        .from('game_vehicles')
        .update({ 
          vehicle_name: input.vehicle_name.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating vehicle:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byGame(data.game_id) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) })
    },
  })
}

// Hook to delete a vehicle
export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ vehicleId, gameId }: { vehicleId: string; gameId: string }) => {
      // Check if any teams are using this vehicle
      const { data: teamsUsingVehicle } = await supabase
        .from('teams')
        .select('id')
        .eq('vehicle_id', vehicleId)
        .limit(1)

      if (teamsUsingVehicle && teamsUsingVehicle.length > 0) {
        throw new Error('Seda sõidukit kasutavad tiimid. Eemalda esmalt sõiduk tiimidest.')
      }

      const { error } = await supabase
        .from('game_vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) {
        console.error('Error deleting vehicle:', error)
        throw error
      }

      return { vehicleId, gameId }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.all })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.byGame(variables.gameId) })
    },
  })
}

// Hook to get vehicles for a specific game (used in team forms)
export function useVehiclesForGame(gameId: string | undefined) {
  return useQuery({
    queryKey: ['vehicles-for-game', gameId],
    queryFn: async () => {
      if (!gameId) return []
      
      const { data, error } = await supabase
        .from('game_vehicles')
        .select('*')
        .eq('game_id', gameId)
        .order('vehicle_name', { ascending: true })

      if (error) {
        console.error('Error fetching vehicles for game:', error)
        throw error
      }

      return data as GameVehicle[]
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}