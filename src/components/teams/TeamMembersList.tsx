// src/components/teams/TeamMembersList.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface TeamMembersListProps {
  teamId: string
}

export function TeamMembersList({ teamId }: TeamMembersListProps) {
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}