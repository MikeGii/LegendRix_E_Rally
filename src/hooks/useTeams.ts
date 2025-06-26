// src/hooks/useTeams.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

// Types
export interface Team {
  id: string
  manager_id: string
  team_name: string
  members_count: number
  max_members_count: number
  manager?: {
    id: string
    name: string
    player_name?: string
  }
}

export interface CreateTeamInput {
  team_name: string
  manager_id: string
  max_members_count: number
}

export interface UpdateTeamInput {
  id: string
  team_name?: string
  manager_id?: string
  max_members_count?: number
}

// Query keys for teams
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  userTeamStatus: (userId: string) => [...teamKeys.all, 'user-status', userId] as const,
  userTeam: (userId: string) => [...teamKeys.all, 'user-team', userId] as const,
}

// Hook to check if user has a team
export function useUserTeamStatus() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: teamKeys.userTeamStatus(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) {
        return { hasTeam: false }
      }

      console.log('🔄 Checking team status for user:', user.id)
      
      const { data, error } = await supabase
        .from('users')
        .select('has_team')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching team status:', error)
        throw error
      }

      console.log('✅ Team status:', data?.has_team)
      
      return {
        hasTeam: data?.has_team || false
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook to get user's team information
export function useUserTeam() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: teamKeys.userTeam(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) {
        return null
      }

      console.log('🔄 Fetching user team info:', user.id)
      
      // First check if user is a manager
      const { data: managerTeam, error: managerError } = await supabase
        .from('teams')
        .select(`
          *,
          manager:users!teams_manager_id_fkey(
            id,
            name,
            player_name,
            is_manager
          )
        `)
        .eq('manager_id', user.id)
        .single()

      if (managerTeam && !managerError) {
        console.log('✅ User is team manager')
        return {
          team: managerTeam as Team,
          isManager: true
        }
      }

      // TODO: In future, check if user is a team member
      // For now, if user has has_team=true but is not a manager,
      // we'll need to implement team_members table lookup
      
      console.log('❌ User team not found')
      return null
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  })
}

// Hook to fetch all teams
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: async () => {
      console.log('🔄 Fetching all teams...')
      
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:users!teams_manager_id_fkey(
            id,
            name,
            player_name
          )
        `)
        .order('team_name', { ascending: true })

      if (error) {
        console.error('Error fetching teams:', error)
        throw error
      }

      console.log(`✅ Teams loaded: ${data?.length || 0}`)
      
      return data as Team[]
    },
    staleTime: 30 * 1000,
  })
}

// Hook to create a team
export function useCreateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      console.log('🔄 Creating team:', input)
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          team_name: input.team_name,
          manager_id: input.manager_id,
          max_members_count: input.max_members_count,
          members_count: 0
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating team:', error)
        throw error
      }

      // Update the manager's is_manager and has_team status
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_manager: true,
          has_team: true 
        })
        .eq('id', input.manager_id)

      if (updateError) {
        console.error('Error updating manager status:', updateError)
      }

      console.log('✅ Team created successfully')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

// Hook to update a team
export function useUpdateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: UpdateTeamInput) => {
      console.log('🔄 Updating team:', input)
      
      const { id, ...updateData } = input
      
      // If changing manager, we need to handle old and new manager status
      if (updateData.manager_id) {
        // Get current team data to find old manager
        const { data: currentTeam } = await supabase
          .from('teams')
          .select('manager_id')
          .eq('id', id)
          .single()
        
        if (currentTeam && currentTeam.manager_id !== updateData.manager_id) {
          // Remove is_manager from old manager (but keep has_team if they're still a member)
          await supabase
            .from('users')
            .update({ is_manager: false })
            .eq('id', currentTeam.manager_id)
          
          // Add is_manager and has_team to new manager
          await supabase
            .from('users')
            .update({ 
              is_manager: true,
              has_team: true 
            })
            .eq('id', updateData.manager_id)
        }
      }
      
      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating team:', error)
        throw error
      }

      console.log('✅ Team updated successfully')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

// Hook to delete a team
export function useDeleteTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      console.log('🔄 Deleting team:', teamId)
      
      // Get team data to find manager and members
      const { data: team } = await supabase
        .from('teams')
        .select('manager_id')
        .eq('id', teamId)
        .single()
      
      if (team) {
        // Remove is_manager and has_team from manager
        await supabase
          .from('users')
          .update({ 
            is_manager: false,
            has_team: false 
          })
          .eq('id', team.manager_id)
        
        // TODO: In future, also update has_team for all team members
      }
      
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) {
        console.error('Error deleting team:', error)
        throw error
      }

      console.log('✅ Team deleted successfully')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}

// Hook to search users
export function useUserSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 3) {
        return []
      }

      console.log('🔄 Searching users:', searchTerm)
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, player_name, email')
        .or(`name.ilike.%${searchTerm}%,player_name.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) {
        console.error('Error searching users:', error)
        throw error
      }

      console.log(`✅ Found ${data?.length || 0} users`)
      return data || []
    },
    enabled: searchTerm.length >= 3,
    staleTime: 10 * 1000,
  })
}