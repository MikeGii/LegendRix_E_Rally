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
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
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
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h3 className="text-xl font-semibold text-white mb-6">
        Tiimi liikmed ({members.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Mängija nimi</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Liitus kuupäeval</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Roll</th>
              {isManager && (
                <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Tegevused</th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr 
                key={member.user_id}
                className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-900/20' : ''
                }`}
              >
                <td className="py-4 px-4 text-white">
                  <div className="flex items-center space-x-2">
                    {member.role === 'manager' && <span>👑</span>}
                    <span>
                      {member.user.player_name || member.user.name}
                      {member.user.player_name && (
                        <span className="text-sm text-slate-400 ml-2">
                          ({member.user.name})
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-300">
                  {formatDate(member.joined_at)}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    member.role === 'manager'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                  }`}>
                    {member.role === 'manager' ? 'Pealik' : 'Liige'}
                  </span>
                </td>
                {isManager && (
                  <td className="py-4 px-4 text-center">
                    {member.role !== 'manager' && member.user_id !== user?.id ? (
                      <button
                        onClick={() => handleRemoveMember(member.user_id, member.user.player_name || member.user.name)}
                        disabled={removeTeamMemberMutation.isPending}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-1 mx-auto"
                      >
                        <span>🗑️</span>
                        <span>Eemalda</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info message for managers */}
      {isManager && members.length > 1 && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 Tiimi pealikuna saad eemaldada liikmeid oma tiimist. Sa ei saa eemaldada iseennast ega muuta oma rolli.
          </p>
        </div>
      )}
    </div>
  )
}