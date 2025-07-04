// src/components/teams/RemovalRequestsSection.tsx
'use client'

import { useState } from 'react'
import { useTeamRemovalRequests, useHandleRemovalRequest } from '@/hooks/useTeams'

export function RemovalRequestsSection() {
  const { data: requests = [], isLoading } = useTeamRemovalRequests()
  const handleRemovalMutation = useHandleRemovalRequest()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleRemovalRequest = async (request: any, action: 'approve' | 'reject') => {
    setProcessingId(request.id)
    try {
      await handleRemovalMutation.mutateAsync({
        requestId: request.id,
        action,
        userId: request.user_id,
        teamId: request.team_id
      })
      alert(action === 'approve' ? 'Eemaldamine kinnitatud!' : 'Eemaldamine tagasi lükatud!')
    } catch (error) {
      alert('Viga taotluse käsitlemisel')
    } finally {
      setProcessingId(null)
    }
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

  if (isLoading) {
    return (
      <div className="relative bg-black rounded-2xl border border-red-900/20 p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 to-black pointer-events-none"></div>
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-800 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin eemaldamise taotlusi...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-black rounded-2xl border border-red-900/20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 to-black pointer-events-none"></div>
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 gradient-orb gradient-orb-red opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 gradient-orb gradient-orb-orange opacity-10"></div>
      
      {/* Header */}
      <div className="relative z-10 px-8 py-6 border-b border-red-900/20 bg-gradient-to-r from-black to-gray-950/50">
        <h3 className="text-xl font-black text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
          <span className="text-red-500 text-2xl animate-pulse">⚠</span>
          <span className="text-glow-red">Eemaldamise taotlused</span>
          {requests.length > 0 && (
            <span className="ml-2 px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm font-['Orbitron'] animate-pulse border border-red-500/30">
              {requests.length}
            </span>
          )}
        </h3>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-600">∅</span>
            </div>
            <p className="text-gray-500 font-['Orbitron'] uppercase tracking-wider">
              Eemaldamise taotlusi pole
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div 
                key={request.id}
                className="group relative tech-border rounded-xl p-6 bg-gradient-to-r from-gray-950/50 to-black hover:from-gray-900/50 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                        <span className="text-2xl">🚫</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">
                          Eemaldatav mängija: <span className="text-red-400 text-glow-red">
                            {request.user?.player_name || request.user?.name}
                          </span>
                        </p>
                        <p className="text-sm text-gray-400 font-['Orbitron'] uppercase tracking-wider">
                          Tiim: <span className="text-orange-400">{request.team?.team_name}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-1 ml-16">
                      <p className="font-['Orbitron']">
                        Taotluse esitas: <span className="text-gray-400">
                          {request.requested_by?.player_name || request.requested_by?.name}
                        </span>
                      </p>
                      <p className="font-['Orbitron']">
                        Aeg: <span className="text-gray-400">{formatDate(request.removal_requested_at)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRemovalRequest(request, 'approve')}
                      disabled={processingId === request.id || handleRemovalMutation.isPending}
                      className="
                        group/btn relative px-5 py-2.5 
                        bg-gradient-to-r from-green-900/20 to-green-800/10 
                        border border-green-500/30 text-green-400 
                        rounded-lg font-['Orbitron'] uppercase tracking-wider 
                        text-sm font-bold transition-all duration-200 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] 
                        hover:border-green-500/50 hover:text-green-300
                        hover:from-green-900/30 hover:to-green-800/20
                      "
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {processingId === request.id && handleRemovalMutation.isPending ? (
                          <>
                            <div className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                            <span>Kinnitan...</span>
                          </>
                        ) : (
                          <>
                            <span>✓</span>
                            <span>Kinnita</span>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-green-500/10 rounded-lg blur-xl group-hover/btn:bg-green-500/20 transition-all duration-300"></div>
                    </button>
                    
                    <button
                      onClick={() => handleRemovalRequest(request, 'reject')}
                      disabled={processingId === request.id || handleRemovalMutation.isPending}
                      className="
                        group/btn relative px-5 py-2.5 
                        bg-gradient-to-r from-red-900/20 to-red-800/10 
                        border border-red-500/30 text-red-400 
                        rounded-lg font-['Orbitron'] uppercase tracking-wider 
                        text-sm font-bold transition-all duration-200 
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] 
                        hover:border-red-500/50 hover:text-red-300
                        hover:from-red-900/30 hover:to-red-800/20
                      "
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {processingId === request.id && handleRemovalMutation.isPending ? (
                          <>
                            <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                            <span>Lükkan tagasi...</span>
                          </>
                        ) : (
                          <>
                            <span>✕</span>
                            <span>Lükka tagasi</span>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-red-500/10 rounded-lg blur-xl group-hover/btn:bg-red-500/20 transition-all duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}