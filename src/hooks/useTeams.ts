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
  game_id?: string
  class_id?: string
  manager?: {
    id: string
    name: string
    player_name?: string
  }
  game?: {
    id: string
    name: string
  }
  game_class?: {
    id: string
    name: string
  }
}

export interface CreateTeamInput {
  team_name: string
  manager_id: string
  max_members_count: number
  game_id: string
  class_id: string
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
      
      const { data, error } = await supabase
        .from('users')
        .select('has_team')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching team status:', error)
        throw error
      }
      
      return {
        hasTeam: data?.has_team || false
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
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

      // Check team_members table for user's team
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          status
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single()

      if (teamMember && !memberError) {
        // Fetch the full team data separately
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select(`
            *,
            manager:users!teams_manager_id_fkey(
              id,
              name,
              player_name
            ),
            game:games!teams_game_id_fkey(
              id,
              name
            ),
            game_class:game_classes!teams_class_id_fkey(
              id,
              name
            )
          `)
          .eq('id', teamMember.team_id)
          .single()

        if (team && !teamError) {
          return {
            team: team as Team,
            isManager: teamMember.role === 'manager'
          }
        }
      }
      
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
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:users!teams_manager_id_fkey(
            id,
            name,
            player_name
          ),
          game:games!teams_game_id_fkey(
            id,
            name
          ),
          game_class:game_classes!teams_class_id_fkey(
            id,
            name
          )
        `)
        .order('team_name', { ascending: true })

      if (error) {
        console.error('Error fetching teams:', error)
        throw error
      }
      
      return data as Team[]
    },
    staleTime: 30 * 1000,
  })
}

// Hook to create a team
export function useCreateTeam() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          team_name: input.team_name,
          manager_id: input.manager_id,
          max_members_count: input.max_members_count,
          members_count: 0,  // Will be updated by trigger
          game_id: input.game_id,
          class_id: input.class_id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating team:', error)
        throw error
      }

      // Insert manager as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          user_id: input.manager_id,
          team_id: data.id,
          role: 'manager',
          status: 'approved'
        }])

      if (memberError) {
        console.error('Error adding manager as team member:', memberError)
        // Should rollback team creation here in production
        throw memberError
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

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.userTeam(user?.id || '') })
      queryClient.invalidateQueries({ queryKey: teamKeys.userTeamStatus(user?.id || '') })
    },
  })
}

// Hook to update a team
export function useUpdateTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (input: UpdateTeamInput) => {
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
          // Update old manager in team_members
          await supabase
            .from('team_members')
            .update({ role: 'member' })
            .eq('user_id', currentTeam.manager_id)
            .eq('team_id', id)
          
          // Remove is_manager from old manager
          await supabase
            .from('users')
            .update({ is_manager: false })
            .eq('id', currentTeam.manager_id)
          
          // Update new manager in team_members
          await supabase
            .from('team_members')
            .update({ role: 'manager' })
            .eq('user_id', updateData.manager_id)
            .eq('team_id', id)
          
          // Add is_manager to new manager
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
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      // Get all team members to update their has_team status
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
      
      if (members && members.length > 0) {
        // Update has_team and is_manager for all members
        const userIds = members.map(m => m.user_id)
        await supabase
          .from('users')
          .update({ 
            has_team: false,
            is_manager: false 
          })
          .in('id', userIds)
      }
      
      // Delete team (team_members will be cascade deleted)
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) {
        console.error('Error deleting team:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.userTeam(user?.id || '') })
      queryClient.invalidateQueries({ queryKey: teamKeys.userTeamStatus(user?.id || '') })
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
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, player_name, email')
        .or(`name.ilike.%${searchTerm}%,player_name.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) {
        console.error('Error searching users:', error)
        throw error
      }

      return data || []
    },
    enabled: searchTerm.length >= 3,
    staleTime: 10 * 1000,
  })
}

// Hook to apply for a team
export function useApplyForTeam() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Check if user already has a team
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingMembership) {
        throw new Error('Sa kuulud juba mõnda tiimi')
      }

      // Apply for team
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          user_id: user.id,
          team_id: teamId,
          role: 'member',
          status: 'pending'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error applying for team:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      queryClient.invalidateQueries({ queryKey: teamKeys.userTeamStatus(user?.id || '') })
    },
  })
}

// Hook to get team applications (for managers)
export function useTeamApplications(teamId: string) {
  return useQuery({
    queryKey: ['team-applications', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          applied_at,
          users (
            name,
            player_name,
            email
          )
        `)
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('applied_at', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error)
        throw error
      }

      // Transform the data
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        applied_at: item.applied_at,
        user: Array.isArray(item.users) ? item.users[0] : item.users
      }))
    },
    enabled: !!teamId,
    staleTime: 30 * 1000,
  })
}

// Hook to approve/reject applications
export function useHandleApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ applicationId, action, teamId }: {
      applicationId: string
      action: 'approve' | 'reject'
      teamId: string
    }) => {
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      
      // Get the user_id from the application
      const { data: application } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('id', applicationId)
        .single()
      
      if (!application) {
        throw new Error('Application not found')
      }
      
      // Update the application status
      const { error } = await supabase
        .from('team_members')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application:', error)
        throw error
      }

      // If approved, update user's has_team status
      if (action === 'approve') {
        await supabase
          .from('users')
          .update({ has_team: true })
          .eq('id', application.user_id)
      }

      return { applicationId, action }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-applications', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}