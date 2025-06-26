// src/components/teams/TeamMembersList.tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useUserTeam } from '@/hooks/useTeams'

interface TeamMembersListProps {
  teamId: string
}

// Hook to remove a team member
function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      // First, get the team member record
      const { data: memberData, error: fetchError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !memberData) {
        throw new Error('Tiimi liiget ei leitud')
      }

      // Don't allow removing the manager
      if (memberData.role === 'manager') {
        throw new Error('Tiimi pealikut ei saa eemaldada')
      }

      // Remove the team member
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error removing team member:', deleteError)
        throw deleteError
      }

      // Update user's has_team status
      const { error: updateError } = await supabase
        .from('users')
        .update({ has_team: false })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user status:', updateError)
      }

      return { teamId, userId }
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['teams', 'user-status', variables.userId] })
    },
  })
}

export function TeamMembersList({ teamId }: TeamMembersListProps) {
  const { user } = useAuth()
  const { data: userTeamData } = useUserTeam()
  const removeTeamMemberMutation = useRemoveTeamMember()
  
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          joined_at,
          users (
            name,
            player_name
          )
        `)
        .eq('team_id', teamId)
        .eq('status', 'approved')
        .order('role', { ascending: false }) // Manager first
        .order('joined_at', { ascending: true })

      if (error) {
        console.error('Error fetching team members:', error)
        throw error
      }

      // Transform the data
      return (data || []).map(item => ({
        user_id: item.user_id,
        role: item.role,
        joined_at: item.joined_at,
        user: Array.isArray(item.users) ? item.users[0] : item.users
      }))
    },
    staleTime: 30 * 1000,
  })

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Kas oled kindel, et soovid eemaldada mängija "${memberName}" tiimist?`)) {
      return
    }

    try {
      await removeTeamMemberMutation.mutateAsync({
        teamId,
        userId: memberId
      })
      alert('Mängija edukalt eemaldatud!')
    } catch (error: any) {
      alert(error.message || 'Viga mängija eemaldamisel')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin tiimi liikmeid...</p>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Check if current user is the manager
  const isManager = userTeamData?.isManager || false

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-700/50 bg-slate-900/30">
        <h3 className="text-xl font-semibold text-white flex items-center gap-3">
          <span className="text-2xl">👥</span>
          Tiimi liikmed
          <span className="ml-2 px-3 py-1 bg-blue-600/20 text-blue-300 text-sm font-medium rounded-full">
            {members.length} liiget
          </span>
        </h3>
      </div>
      
      {/* Members Grid/Table */}
      <div className="p-8">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <p className="text-slate-400 text-lg">Tiimis pole veel liikmeid</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member, index) => {
              const isCurrentUser = member.user_id === user?.id
              const isMemberManager = member.role === 'manager'
              
              return (
                <div 
                  key={member.user_id}
                  className={`
                    bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 
                    hover:border-slate-600/50 transition-all duration-200 group
                    ${isCurrentUser ? 'ring-2 ring-blue-500/30' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    {/* Member Info */}
                    <div className="flex items-center gap-4">
                      {/* Avatar/Icon */}
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isMemberManager 
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' 
                          : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                        }
                        group-hover:scale-110 transition-transform duration-200
                      `}>
                        <span className="text-2xl">
                          {isMemberManager ? '👑' : '🎮'}
                        </span>
                      </div>
                      
                      {/* Name and Details */}
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-white">
                            {member.user?.player_name || 'Teadmata mängija'}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
                              Sina
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`
                            px-3 py-1 rounded-full text-sm font-medium
                            ${isMemberManager 
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                            }
                          `}>
                            {isMemberManager ? '👑 Tiimi Pealik' : '✓ Tiimi Liige'}
                          </span>
                          <span className="text-sm text-slate-500">
                            Liitus: {formatDate(member.joined_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isManager && !isMemberManager && member.user_id !== user?.id && (
                      <div className="flex items-center">
                        <button
                          onClick={() => handleRemoveMember(member.user_id, member.user?.player_name || 'Teadmata mängija')}
                          disabled={removeTeamMemberMutation.isPending}
                          className="
                            px-4 py-2 bg-red-600/20 hover:bg-red-600/30 
                            text-red-400 hover:text-red-300 rounded-xl 
                            font-medium text-sm transition-all duration-200 
                            flex items-center gap-2 transform hover:scale-105
                            disabled:opacity-50 disabled:cursor-not-allowed
                            shadow-lg shadow-red-900/20
                          "
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" 
                            />
                          </svg>
                          <span>
                            {removeTeamMemberMutation.isPending ? 'Eemaldan...' : 'Eemalda'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}