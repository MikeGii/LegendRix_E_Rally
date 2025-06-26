// src/hooks/useGames.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Game {
  id: string
  name: string
  is_active: boolean
}

export interface GameClass {
  id: string
  game_id: string
  name: string
  is_active: boolean
}

// Query keys
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  classes: (gameId: string) => [...gameKeys.all, 'classes', gameId] as const,
}

// Hook to fetch all active games
export function useGames() {
  return useQuery({
    queryKey: gameKeys.lists(),
    queryFn: async () => {
      console.log('🔄 Fetching games...')
      
      const { data, error } = await supabase
        .from('games')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching games:', error)
        throw error
      }

      console.log(`✅ Games loaded: ${data?.length || 0}`)
      return data as Game[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to fetch game classes for a specific game
export function useGameClasses(gameId: string) {
  return useQuery({
    queryKey: gameKeys.classes(gameId),
    queryFn: async () => {
      console.log('🔄 Fetching game classes for:', gameId)
      
      const { data, error } = await supabase
        .from('game_classes')
        .select('id, game_id, name, is_active')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching game classes:', error)
        throw error
      }

      console.log(`✅ Game classes loaded: ${data?.length || 0}`)
      return data as GameClass[]
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000,
  })
}