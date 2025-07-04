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
  vehicle_id?: string
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
  vehicle?: {
    id: string
    vehicle_name: string
  }
}

export interface CreateTeamInput {
  team_name: string
  manager_id: string
  max_members_count: number
  game_id: string
  class_id: string
  vehicle_id?: string
}

export interface UpdateTeamInput {
  id: string
  team_name?: string
  manager_id?: string
  max_members_count?: number
  vehicle_id?: string
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
      
      // Check team_members table for approved membership
      const { data: membership, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching team status:', error)
        throw error
      }
      
      return {
        hasTeam: !!membership
      }
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  })
}

// Hook to fetch user's team data
export function useUserTeam() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: teamKeys.userTeam(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) {
        return null
      }
      
      // First get the team membership
      const { data: membership, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .single()

      if (membershipError || !membership) {
        return null
      }

      // Then get the full team data
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
          ),
          vehicle:game_vehicles!teams_vehicle_id_fkey(
            id,
            vehicle_name
          )
        `)
        .eq('id', membership.team_id)
        .single()

      if (teamError || !team) {
        console.error('Error fetching team:', teamError)
        return null
      }

      return {
        team: team as Team,
        isManager: membership.role === 'manager'
      }
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
          ),
          vehicle:game_vehicles!teams_vehicle_id_fkey(
            id,
            vehicle_name
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
          class_id: input.class_id,
          vehicle_id: input.vehicle_id || null
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
    staleTime: 30 * 1000,
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
        .eq('status', 'approved')
        .single()

      if (existingMembership) {
        throw new Error('Sa oled juba tiimi liige')
      }

      // Check if user already applied to this team
      const { data: existingApplication } = await supabase
        .from('team_members')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('team_id', teamId)
        .single()

      if (existingApplication) {
        if (existingApplication.status === 'pending') {
          throw new Error('Sa oled juba kandideerinud sellesse tiimi')
        } else if (existingApplication.status === 'rejected') {
          // Delete the rejected application to allow reapplying
          await supabase
            .from('team_members')
            .delete()
            .eq('id', existingApplication.id)
        }
      }

      // Create application
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          user_id: user.id,
          team_id: teamId,
          role: 'member',
          status: 'pending',
          applied_at: new Date().toISOString()
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
      queryClient.invalidateQueries({ queryKey: ['team-applications'] })
    },
  })
}

// Hook to fetch team applications (for managers)
export function useTeamApplications(teamId: string) {
  return useQuery({
    queryKey: ['team-applications', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          applied_at,
          user:users(
            id,
            name,
            player_name,
            email
          )
        `)
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('applied_at', { ascending: true })

      if (error) {
        console.error('Error fetching team applications:', error)
        throw error
      }

      // Transform the data
      return (data || []).map(item => ({
        id: item.id,
        applied_at: item.applied_at,
        user: Array.isArray(item.user) ? item.user[0] : item.user
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
      if (action === 'reject') {
        // Delete the application instead of updating status
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('id', applicationId)
          
        if (error) {
          console.error('Error deleting application:', error)
          throw error
        }
      } else {
        // Update the application status for approval
        const { error } = await supabase
          .from('team_members')
          .update({ status: newStatus })
          .eq('id', applicationId)
          
        if (error) {
          console.error('Error updating application:', error)
          throw error
        }
      }

      // If approved, update user's has_team status
      if (action === 'approve') {
        await supabase
          .from('users')
          .update({ has_team: true })
          .eq('id', application.user_id)
        
        // Also invalidate the approved user's team status
        queryClient.invalidateQueries({ queryKey: teamKeys.userTeamStatus(application.user_id) })
        queryClient.invalidateQueries({ queryKey: teamKeys.userTeam(application.user_id) })
      }

      return { applicationId, action }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-applications', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
    },
  })
}