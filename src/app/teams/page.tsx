// src/app/teams/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ViewProvider } from '@/components/ViewProvider'
import { TeamHeaderSection } from '@/components/teams/TeamHeaderSection'
import { TeamApplicationsSection } from '@/components/teams/TeamApplicationsSection'
import { TeamMembersList } from '@/components/teams/TeamMembersList'
import { useUserTeam } from '@/hooks/useTeams'

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <ViewProvider>
        <DashboardLayout>
          <TeamsPageContent />
        </DashboardLayout>
      </ViewProvider>
    </ProtectedRoute>
  )
}

function TeamsPageContent() {
  const { data: userTeamData } = useUserTeam()
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span>👥</span>
              <span>Tiimid</span>
            </h1>
            <p className="text-slate-400 mt-2">
              Siin saad näha oma tiimiga seonduvat
            </p>
          </div>
          {/* Back to Dashboard Button */}
          <button
            onClick={() => window.location.href = '/user-dashboard'}
            className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 border border-slate-600/50 hover:border-slate-500/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Tagasi</span>
          </button>
        </div>
      </div>

      {/* Team Applications Section - Only for managers, shown above team info */}
      {userTeamData?.isManager && userTeamData.team && (
        <TeamApplicationsSection teamId={userTeamData.team.id} />
      )}

      {/* Team Header Section Component */}
      <TeamHeaderSection />

      {/* Team Members List - Only show if user has a team */}
      {userTeamData?.team && (
        <TeamMembersList teamId={userTeamData.team.id} />
      )}
    </div>
  )
}