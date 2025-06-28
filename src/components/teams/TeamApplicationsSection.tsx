// src/components/teams/TeamApplicationsSection.tsx
'use client'

import { useState } from 'react'
import { useTeamApplications, useHandleApplication } from '@/hooks/useTeams'
import { ClickablePlayerName } from '@/components/player/ClickablePlayerName'

interface TeamApplicationsSectionProps {
  teamId: string
}

export function TeamApplicationsSection({ teamId }: TeamApplicationsSectionProps) {
  const { data: applications = [], isLoading } = useTeamApplications(teamId)
  const handleApplicationMutation = useHandleApplication()
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)

  const handleApplication = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      await handleApplicationMutation.mutateAsync({
        applicationId,
        action,
        teamId
      })
      alert(action === 'approve' ? 'Taotlus kinnitatud!' : 'Taotlus tagasi lükatud!')
    } catch (error) {
      alert('Viga taotluse käsitlemisel')
    }
  }

  if (isLoading) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="flex justify-center relative z-10 p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin taotlusi...</p>
          </div>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Prevent modal backdrop clicks from affecting the table
  const handleTableClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orb for ambience */}
      <div className="absolute top-0 right-0 w-48 h-48 gradient-orb gradient-orb-purple opacity-10"></div>
      
      {/* Header */}
      <div className="relative z-10 px-8 py-6 border-b border-purple-500/20 bg-black/30">
        <h3 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
          <span className="text-purple-500">◈</span>
          Taotlused
          <span className="ml-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-['Orbitron']">
            {applications.length}
          </span>
        </h3>
      </div>
      
      {/* Table */}
      <div className="relative z-10 p-8">
        <div className="overflow-x-auto" onClick={handleTableClick}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Mängija nimi
                </th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Taotluse kuupäev
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                  Tegevused
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application, index) => (
                <tr 
                  key={application.id}
                  className={`border-b border-gray-800/50 transition-all duration-300 hover:bg-purple-500/5 ${
                    index % 2 === 0 ? 'bg-gray-900/20' : ''
                  }`}
                >
                  <td className="py-5 px-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 font-['Orbitron'] font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <ClickablePlayerName
                        userId={application.user.id}
                        playerName={application.user.player_name || application.user.name}
                        participantType="registered"
                        className="font-medium text-white hover:text-purple-400 transition-colors inline-block"
                        onModalOpen={() => setIsPlayerModalOpen(true)}
                        onModalClose={() => setIsPlayerModalOpen(false)}
                      />
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500/60">📅</span>
                      <span className="text-gray-300 font-['Orbitron']">
                        {formatDate(application.applied_at)}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleApplication(application.id, 'approve')}
                        disabled={handleApplicationMutation.isPending || isPlayerModalOpen}
                        className="group relative px-5 py-2.5 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-500/30 text-green-400 rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:border-green-500/50"
                      >
                        <span className="relative z-10">✓ Kinnita</span>
                      </button>
                      <button
                        onClick={() => handleApplication(application.id, 'reject')}
                        disabled={handleApplicationMutation.isPending || isPlayerModalOpen}
                        className="group relative px-5 py-2.5 bg-gradient-to-r from-red-900/20 to-red-800/10 border border-red-500/30 text-red-400 rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-red-500/50"
                      >
                        <span className="relative z-10">✕ Lükka tagasi</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}