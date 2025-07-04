// src/components/teams/TeamMembersList.tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useUserTeam } from '@/hooks/useTeams'

interface TeamMembersListProps {
  teamId: string
}

interface TeamMember {
  user_id: string
  role: string
  joined_at: string
  status?: string
  user: {
    name: string
    player_name?: string
  }
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
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        throw new Error('Kasutaja pole autentitud')
      }

      // Update the team member status to removal_requested
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ 
          status: 'removal_requested',
          removal_requested_at: new Date().toISOString(),
          removal_requested_by: currentUser.id
        })
        .eq('team_id', teamId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error requesting team member removal:', updateError)
        throw updateError
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
        status,
        users:users!team_members_user_id_fkey (
          name,
          player_name
        )
      `)
      .eq('team_id', teamId)
      .in('status', ['approved', 'removal_requested'])
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
        status: item.status,
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
      alert('Eemaldamise taotlus saadetud! Admin peab selle kinnitama.')
    } catch (error: any) {
      alert(error.message || 'Viga mängija eemaldamisel')
    }
  }

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-orange-500/20 p-8 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="flex justify-center relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin tiimi liikmeid...</p>
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
    <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-orange-500/20 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orbs for ambience */}
      <div className="absolute top-0 left-0 w-48 h-48 gradient-orb gradient-orb-orange opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 gradient-orb gradient-orb-red opacity-10"></div>
      
      {/* Header */}
      <div className="relative z-10 px-8 py-6 border-b border-orange-500/20 bg-black/30">
        <h3 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
          <span className="text-orange-500 text-2xl">◆</span>
          Tiimi liikmed
          <span className="ml-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-['Orbitron']">
            {members.length}
          </span>
        </h3>
      </div>
      
      {/* Members List */}
      <div className="relative z-10 p-8">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <p className="text-gray-400 text-lg font-['Orbitron'] uppercase tracking-wider">Tiimis pole veel liikmeid</p>
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
                    group relative tech-border rounded-xl p-6 
                    bg-gradient-to-br from-gray-900/50 to-black/50
                    transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,69,0,0.2)]
                    ${isCurrentUser ? 'ring-2 ring-orange-500/30' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    {/* Member Info */}
                    <div className="flex items-center gap-4">
                      {/* Avatar/Icon */}
                      <div className={`
                        w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isMemberManager 
                          ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/20 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                          : 'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30'
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
                          <h4 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                            {member.user?.player_name || 'Teadmata mängija'}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-bold font-['Orbitron'] uppercase tracking-wider">
                              Sina
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`
                            px-3 py-1 rounded-full text-sm font-bold font-['Orbitron'] uppercase tracking-wider
                            ${isMemberManager 
                              ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/20 text-yellow-400 border border-yellow-500/50' 
                              : 'bg-gradient-to-r from-green-900/30 to-green-800/20 text-green-400 border border-green-500/30'
                            }
                          `}>
                            {isMemberManager ? '👑 Tiimi Pealik' : '✓ Tiimi Liige'}
                          </span>
                          <span className="text-sm text-gray-500 font-['Orbitron']">
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
                            group/btn relative px-5 py-2.5 
                            bg-gradient-to-r from-red-900/20 to-red-800/10 
                            border border-red-500/30 text-red-400 
                            rounded-lg font-['Orbitron'] uppercase tracking-wider 
                            text-sm font-bold transition-all duration-200 
                            disabled:opacity-50 disabled:cursor-not-allowed
                            hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] 
                            hover:border-red-500/50
                          "
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" 
                              />
                            </svg>
                            <span>
                              {removeTeamMemberMutation.isPending ? 'Eemaldan...' : 'Eemalda'}
                            </span>
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