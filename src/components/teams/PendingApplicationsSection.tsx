// src/components/teams/PendingApplicationsSection.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface PendingApplication {
  id: string
  team_id: string
  user_id: string
  applied_at: string
  user: {
    id: string
    name: string
    player_name?: string
    email: string
  }
  team: {
    id: string
    team_name: string
    manager?: {
      player_name?: string
      name: string
    }
  }
}

// Hook to fetch all pending applications across all teams
function useAllPendingApplications() {
  return useQuery({
    queryKey: ['all-pending-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          team_id,
          user_id,
          applied_at,
          user:users!team_members_user_id_fkey(
            id,
            name,
            player_name,
            email
          ),
          team:teams(
            id,
            team_name,
            manager:users!teams_manager_id_fkey(
              name,
              player_name
            )
          )
        `)
        .eq('status', 'pending')
        .order('applied_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending applications:', error)
        throw error
      }

      // Transform the data
      return (data || []).map(item => {
        const teamData = Array.isArray(item.team) ? item.team[0] : item.team
        const userData = Array.isArray(item.user) ? item.user[0] : item.user
        
        return {
          id: item.id,
          team_id: item.team_id,
          user_id: item.user_id,
          applied_at: item.applied_at,
          user: userData,
          team: {
            id: teamData?.id,
            team_name: teamData?.team_name,
            manager: Array.isArray(teamData?.manager) ? teamData.manager[0] : teamData?.manager
          }
        }
      }) as PendingApplication[]
    },
    staleTime: 30 * 1000,
  })
}

// Hook to handle applications (approve/reject)
function useHandleApplication() {
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
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['all-pending-applications'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

export function PendingApplicationsSection() {
  const { data: applications = [], isLoading } = useAllPendingApplications()
  const handleApplicationMutation = useHandleApplication()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleApplication = async (application: PendingApplication, action: 'approve' | 'reject') => {
    setProcessingId(application.id)
    try {
      await handleApplicationMutation.mutateAsync({
        applicationId: application.id,
        action,
        teamId: application.team_id
      })
      alert(action === 'approve' ? 'Taotlus kinnitatud!' : 'Taotlus tagasi lükatud!')
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
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="flex justify-center relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider">Laadin taotlusi...</p>
          </div>
        </div>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3 mb-6">
            <span className="text-purple-500">◆</span>
            Ootel taotlused
          </h2>
          
          <div className="text-center py-8">
            <p className="text-gray-400 font-['Rajdhani']">Hetkel pole ühtegi ootel taotlust.</p>
          </div>
        </div>
      </div>
    )
  }

  // Group applications by team
  const applicationsByTeam = applications.reduce((acc, app) => {
    if (!acc[app.team_id]) {
      acc[app.team_id] = {
        teamName: app.team.team_name,
        manager: app.team.manager,
        applications: []
      }
    }
    acc[app.team_id].applications.push(app)
    return acc
  }, {} as Record<string, { teamName: string; manager: any; applications: PendingApplication[] }>)

  return (
    <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Scanning line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scan-line scan-line-purple"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-8 py-6 border-b border-purple-500/20 bg-black/30">
        <h2 className="text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider flex items-center gap-3">
          <span className="text-purple-500">◆</span>
          Ootel taotlused
          <span className="ml-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-['Orbitron']">
            {applications.length}
          </span>
        </h2>
      </div>
      
      {/* Applications by Team */}
      <div className="relative z-10 p-8 space-y-6">
        {Object.entries(applicationsByTeam).map(([teamId, teamData]) => (
          <div key={teamId} className="tech-border rounded-xl p-6 bg-gradient-to-br from-purple-900/10 to-black/50">
            {/* Team Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-purple-500/20">
              <div>
                <h3 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wide">
                  {teamData.teamName}
                </h3>
                <p className="text-sm text-purple-400 mt-1">
                  Pealik: {teamData.manager?.player_name || teamData.manager?.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-purple-500 font-['Orbitron'] font-bold text-lg">
                  {teamData.applications.length}
                </span>
                <p className="text-xs text-gray-500 uppercase tracking-wider">taotlust</p>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
              {teamData.applications.map((application) => (
                <div 
                  key={application.id}
                  className="group flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300"
                >
                  {/* Applicant Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400">👤</span>
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-purple-400 transition-colors">
                        {application.user.player_name || application.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(application.applied_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplication(application, 'approve')}
                      disabled={processingId === application.id || handleApplicationMutation.isPending}
                      className="px-3 py-1.5 bg-green-900/30 hover:bg-green-800/40 text-green-400 hover:text-green-300 rounded-lg text-sm font-medium transition-all duration-200 border border-green-800/50 hover:border-green-700/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingId === application.id && handleApplicationMutation.isPending ? (
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
                    </button>
                    
                    <button
                      onClick={() => handleApplication(application, 'reject')}
                      disabled={processingId === application.id || handleApplicationMutation.isPending}
                      className="px-3 py-1.5 bg-red-900/30 hover:bg-red-800/40 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-800/50 hover:border-red-700/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {processingId === application.id && handleApplicationMutation.isPending ? (
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
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tech corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500/30 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500/30 rounded-br-lg"></div>
    </div>
  )
}