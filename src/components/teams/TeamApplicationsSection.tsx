// src/components/teams/TeamApplicationsSection.tsx
'use client'

import { useTeamApplications, useHandleApplication } from '@/hooks/useTeams'

interface TeamApplicationsSectionProps {
  teamId: string
}

export function TeamApplicationsSection({ teamId }: TeamApplicationsSectionProps) {
  const { data: applications = [], isLoading } = useTeamApplications(teamId)
  const handleApplicationMutation = useHandleApplication()

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
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin taotlusi...</p>
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

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h3 className="text-xl font-semibold text-white mb-6">
        Taotlused ({applications.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Mängija nimi</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-300">Taotluse kuupäev</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-300">Tegevused</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application, index) => (
              <tr 
                key={application.id}
                className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                  index % 2 === 0 ? 'bg-slate-900/20' : ''
                }`}
              >
                <td className="py-4 px-4 text-white">
                  {application.user.player_name || application.user.name}
                  {application.user.player_name && (
                    <span className="text-sm text-slate-400 ml-2">
                      ({application.user.name})
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-slate-300">
                  {formatDate(application.applied_at)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleApplication(application.id, 'approve')}
                      disabled={handleApplicationMutation.isPending}
                      className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50"
                    >
                      Kinnita
                    </button>
                    <button
                      onClick={() => handleApplication(application.id, 'reject')}
                      disabled={handleApplicationMutation.isPending}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50"
                    >
                      Lükka tagasi
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}