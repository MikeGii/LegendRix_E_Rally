// src/components/teams/TeamApplicationModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Team } from '@/hooks/useTeams'
import { supabase } from '@/lib/supabase'

interface TeamMember {
  user_id: string
  role: 'manager' | 'member'
  user: {
    name: string
    player_name?: string
  }
}

interface TeamApplicationModalProps {
  team: Team
  onClose: () => void
  onApply: (teamId: string) => void
}

export function TeamApplicationModal({ team, onClose, onApply }: TeamApplicationModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTeamMembers()
  }, [team.id])

  const fetchTeamMembers = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          role,
          users (
            name,
            player_name
          )
        `)
        .eq('team_id', team.id)
        .eq('status', 'approved')
        .order('role', { ascending: false }) // Manager first

      if (error) {
        console.error('Error fetching team members:', error)
      } else {
        // Transform the data to match our interface
        const transformedData = (data || []).map(item => ({
          user_id: item.user_id,
          role: item.role,
          user: Array.isArray(item.users) ? item.users[0] : item.users
        }))
        setMembers(transformedData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white pr-12">
            Kandideeri tiimi: {team.team_name}
          </h2>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Sulge"
          >
            <svg className="w-6 h-6 text-slate-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Team Info */}
          <div className="mb-6 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">Mäng</p>
                <p className="text-white font-medium">{team.game?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Klass</p>
                <p className="text-white font-medium">{team.game_class?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Kohti täidetud</p>
                <p className="text-white font-medium">{team.members_count} / {team.max_members_count}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Vabu kohti</p>
                <p className="text-white font-medium">{team.max_members_count - team.members_count}</p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tiimi liikmed</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : members.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Tiimi liikmete info pole saadaval</p>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.user_id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border ${
                      member.role === 'manager'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-900/50 border-slate-700/50'
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {member.role === 'manager' ? (
                        <span className="text-2xl">👑</span>
                      ) : (
                        <span className="text-2xl">🏁</span>
                      )}
                    </div>
                    
                    {/* Member Info */}
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {member.user.name}
                        {member.user.player_name && (
                          <span className="text-sm text-slate-400 ml-2">
                            ({member.user.player_name})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-400">
                        {member.role === 'manager' ? 'Tiimi pealik' : 'Liige'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Kandideerides saadad tiimi pealikule taotluse
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Tühista
              </button>
              <button
                onClick={() => onApply(team.id)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/25"
              >
                Saada taotlus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}