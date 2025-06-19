// src/hooks/useUserAchievements.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useUserStatistics } from './useUserStatistics'

export interface UserAchievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'training' | 'participation' | 'victory' | 'championship'
  requirement: string
  earned: boolean
  earnedAt?: string
  progress?: {
    current: number
    required: number
    percentage: number
  }
}

// Define all available achievements
const ACHIEVEMENT_DEFINITIONS: Omit<UserAchievement, 'earned' | 'earnedAt' | 'progress'>[] = [
  {
    id: 'trained_driver',
    title: 'Treenitud sõitja',
    description: 'Osales vähemalt ühel treeningul',
    icon: '🏋️',
    type: 'training',
    requirement: 'Osale 1 treeningul'
  },
  {
    id: 'rally_junior',
    title: 'Ralli juunior',
    description: 'Osales 3 rallil (v.a treeningud)',
    icon: '🚗',
    type: 'participation',
    requirement: 'Osale 3 rallil'
  },
  {
    id: 'winner',
    title: 'Võitja',
    description: 'Võitis vähemalt ühe ralli',
    icon: '🥇',
    type: 'victory',
    requirement: 'Võida 1 ralli (mitte treening)'
  },
  {
    id: 'champion',
    title: 'Meister',
    description: 'Võitis vähemalt ühe meistrivõistluse',
    icon: '👑',
    type: 'championship',
    requirement: 'Võida 1 lõpetatud meistrivõistlus'
  }
]

export function useUserAchievements(userId: string) {
  const { data: statistics } = useUserStatistics(userId)

  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async (): Promise<UserAchievement[]> => {
      if (!userId || !statistics) {
        return ACHIEVEMENT_DEFINITIONS.map(def => ({
          ...def,
          earned: false
        }))
      }

      console.log('🔄 Calculating user achievements...', { userId, statistics })

      // Get championship wins (only completed championships)
      const { data: championshipWins, error: championshipError } = await supabase
        .from('user_championship_titles')
        .select(`
          id,
          awarded_at,
          championships!inner(
            status
          )
        `)
        .eq('user_id', userId)
        .eq('is_completed', true)

      if (championshipError) {
        console.error('Error fetching championship wins:', championshipError)
      }

      // Filter only completed championships
      const completedChampionshipWins = (championshipWins || []).filter(title => 
        (title.championships as any)?.status === 'completed'
      )

      // Calculate achievements
      const achievements: UserAchievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
        let earned = false
        let earnedAt: string | undefined
        let progress: UserAchievement['progress'] | undefined

        switch (def.id) {
          case 'trained_driver':
            earned = statistics.trainings >= 1
            if (earned) {
              // Try to get the date of first training participation
              // This would need to be implemented with actual participation dates
              earnedAt = new Date().toISOString() // Placeholder
            } else {
              progress = {
                current: statistics.trainings,
                required: 1,
                percentage: Math.min((statistics.trainings / 1) * 100, 100)
              }
            }
            break

          case 'rally_junior':
            const nonTrainingParticipations = statistics.regularRallies + statistics.championshipRallies
            earned = nonTrainingParticipations >= 3
            if (earned) {
              earnedAt = new Date().toISOString() // Placeholder
            } else {
              progress = {
                current: nonTrainingParticipations,
                required: 3,
                percentage: Math.min((nonTrainingParticipations / 3) * 100, 100)
              }
            }
            break

          case 'winner':
            earned = statistics.rallyWins >= 1
            if (earned) {
              earnedAt = new Date().toISOString() // Placeholder
            } else {
              progress = {
                current: statistics.rallyWins,
                required: 1,
                percentage: Math.min((statistics.rallyWins / 1) * 100, 100)
              }
            }
            break

          case 'champion':
            earned = completedChampionshipWins.length >= 1
            if (earned && completedChampionshipWins.length > 0) {
              earnedAt = completedChampionshipWins[0].awarded_at
            } else {
              progress = {
                current: completedChampionshipWins.length,
                required: 1,
                percentage: Math.min((completedChampionshipWins.length / 1) * 100, 100)
              }
            }
            break
        }

        return {
          ...def,
          earned,
          earnedAt,
          progress
        }
      })

      console.log('✅ User achievements calculated:', achievements.filter(a => a.earned).length, 'earned')
      return achievements
    },
    enabled: !!userId && !!statistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}