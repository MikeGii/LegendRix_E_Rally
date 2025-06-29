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
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [contentRef, setContentRef] = useState<HTMLDivElement | null>(null)
  const [hasScroll, setHasScroll] = useState(false)

  useEffect(() => {
    fetchTeamMembers()
  }, [team.id])

  // Check if content needs scrollbar
  useEffect(() => {
    const checkScroll = () => {
      if (contentRef) {
        const modalHeight = contentRef.parentElement?.offsetHeight || 0
        const viewportHeight = window.innerHeight
        const heightPercentage = (modalHeight / viewportHeight) * 100
        
      // Show scrollbar if modal is taller than 70% of viewport
        setHasScroll(heightPercentage > 70)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [contentRef, members, isLoading])

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const memberPercentage = (team.members_count / team.max_members_count) * 100

  return (
    <>
      {/* Backdrop with high z-index */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Modal container with higher z-index */}
      <div 
        className="fixed inset-0 flex items-start justify-center overflow-y-auto"
        style={{ zIndex: 9999, paddingTop: '6rem', paddingBottom: '2rem' }}
      >
        <div 
          ref={setContentRef}
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-red-500/30 shadow-[0_0_40px_rgba(255,0,64,0.3)] max-w-2xl w-full mx-4 flex flex-col"
          style={{ maxHeight: 'min(80vh, calc(100vh - 8rem))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          {/* Gradient orbs for ambience */}
          <div className="absolute top-0 right-0 w-48 h-48 gradient-orb gradient-orb-red opacity-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 gradient-orb gradient-orb-purple opacity-10"></div>

          {/* Header */}
          <div className="relative p-6 border-b border-red-500/20 bg-black/50">
            <h2 className="text-2xl font-black text-white pr-12 font-['Orbitron'] uppercase tracking-wider">
              <span className="text-red-500">▣</span> Kandideeri tiimi: {team.team_name}
            </h2>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 tech-border rounded-lg transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,0,64,0.5)]"
              aria-label="Sulge"
            >
              <svg className="w-6 h-6 text-red-400 hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div 
            className={`relative z-10 p-6 flex-1 ${hasScroll ? 'overflow-y-auto custom-modal-scrollbar' : 'overflow-hidden'}`}
            style={{ 
              minHeight: '200px',
            }}
          >
            {/* Team Info Card */}
            <div className="mb-6 tech-border rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-black/50">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-purple-500 text-xl">◈</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-['Orbitron']">Mäng</p>
                    <p className="text-white font-bold mt-1">{team.game?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-orange-500 text-xl">◆</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-['Orbitron']">Klass</p>
                    <p className="text-white font-bold mt-1">{team.game_class?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">⬢</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-['Orbitron']">Tiimi sõiduk</p>
                    <p className="text-white font-bold mt-1">{team.vehicle?.vehicle_name || 'Määramata'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-500 text-xl">◉</span>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-['Orbitron']">Kohti täidetud</p>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-white font-['Orbitron']">{team.members_count}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-lg text-gray-400 font-['Orbitron']">{team.max_members_count}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            memberPercentage >= 100 ? 'bg-red-500' : memberPercentage > 75 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${memberPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
                <span className="text-red-500">◈</span> Tiimi liikmed
              </h3>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
                </div>
              ) : members.length === 0 ? (
                <p className="text-gray-400 text-center py-8 font-['Orbitron'] uppercase tracking-wider">
                  Tiimi liikmete info pole saadaval
                </p>
              ) : (
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.user_id}
                      className={`relative tech-border rounded-lg p-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.2)] ${
                        member.role === 'manager'
                          ? 'bg-gradient-to-r from-red-900/20 to-black/20'
                          : 'bg-gradient-to-r from-gray-900/20 to-black/20'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Member number */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-['Orbitron'] font-bold ${
                          member.role === 'manager'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-700/30 text-gray-400 border border-gray-600/30'
                        }`}>
                          {member.role === 'manager' ? '★' : index}
                        </div>
                        
                        {/* Member info */}
                        <div className="flex-1">
                          <p className="font-medium text-white">
                            {member.user.player_name || member.user.name}
                          </p>
                          {member.role === 'manager' && (
                            <p className="text-xs text-red-400 mt-1 font-['Orbitron'] uppercase tracking-wider">
                              Tiimi pealik
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rules Checkbox */}
            <div className="mt-8 tech-border rounded-lg p-4 bg-gradient-to-r from-gray-900/30 to-black/30">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 bg-gray-800 border-2 border-red-500/50 rounded focus:ring-2 focus:ring-red-500 focus:ring-offset-0 checked:bg-red-500 checked:border-red-500 transition-all duration-200"
                />
                <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                  Kinnitan, et olen tutvunud võistluste reeglitega ja nõustun nendega. 
                  Mõistan, et tiimi kandideerimine ei garanteeri automaatset vastuvõtmist.
                  <br /><br />
                  <strong className="text-red-400">Reeglid:</strong>
                  <br />• Tiimi liikmed peavad kasutama tiimile määratud sõidukit
                  <br />• Tiimi liikmed peavad võistlema tiimile määratud klassis
                  <br />• Tiimi suurus on piiratud vastavalt võistluste tingimustele
                  <br />• Tiimi pealik otsustab tiimi tegevus üle
                  <br />• Kõik liikmed peavad järgima võistluse reegleid ja ausat mängu põhimõtteid
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="relative p-6 border-t border-red-500/20 bg-black/50 flex-shrink-0">
            {/* Scroll indicator when content is scrollable */}
            {hasScroll && (
              <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            )}
            
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 tech-border rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm text-gray-300 hover:text-white transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,0,64,0.3)]"
              >
                Tühista
              </button>
              <button
                onClick={() => onApply(team.id)}
                disabled={!rulesAccepted}
                className={`px-6 py-3 rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 ${
                  rulesAccepted
                    ? 'futuristic-btn futuristic-btn-primary'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                Saada taotlus
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}