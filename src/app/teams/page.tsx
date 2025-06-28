// src/app/teams/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ViewProvider } from '@/components/ViewProvider'
import { TeamHeaderSection } from '@/components/teams/TeamHeaderSection'
import { TeamApplicationsSection } from '@/components/teams/TeamApplicationsSection'
import { TeamMembersList } from '@/components/teams/TeamMembersList'
import { useUserTeam } from '@/hooks/useTeams'
import { SectionDivider } from '@/components/landing/SectionDivider'

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
      {/* Page Header - Futuristic Design */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Gradient orbs for ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 gradient-orb gradient-orb-red opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 gradient-orb gradient-orb-purple opacity-20"></div>
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="scan-line"></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white flex items-center gap-4 font-['Orbitron'] uppercase tracking-wider">
                <span className="text-5xl neon-glow text-red-500">⬢</span>
                <span className="text-glow-red">Tiimid</span>
              </h1>
              <p className="text-gray-400 mt-3 text-lg font-light">
                Siin saad näha oma tiimiga seonduvat
              </p>
            </div>
            
            {/* Back to Dashboard Button - Futuristic Style */}
            <button
              onClick={() => window.location.href = '/user-dashboard'}
              className="group relative px-6 py-3 futuristic-btn tech-border rounded-xl flex items-center gap-3 overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <svg className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-white font-['Orbitron'] uppercase tracking-wider text-sm relative z-10">Tagasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <SectionDivider variant="z-pattern" />

      {/* Team Applications Section - Only for managers */}
      {userTeamData?.isManager && userTeamData.team && (
        <>
          <div className="relative">
            {/* Section accent */}
            <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent"></div>
            <TeamApplicationsSection teamId={userTeamData.team.id} />
          </div>
          
          <SectionDivider variant="mixed" />
        </>
      )}

      {/* Team Header Section Component */}
      <div className="relative">
        {/* Section accent */}
        <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-red-500/50 via-red-500/20 to-transparent"></div>
        <TeamHeaderSection />
      </div>

      {/* Section Divider - Only show if user has a team */}
      {userTeamData?.team && (
        <SectionDivider variant="l-corners" />
      )}

      {/* Team Members List - Only show if user has a team */}
      {userTeamData?.team && (
        <div className="relative">
          {/* Section accent */}
          <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-orange-500/50 via-orange-500/20 to-transparent"></div>
          <TeamMembersList teamId={userTeamData.team.id} />
        </div>
      )}

      {/* Bottom spacing with subtle accent */}
      <div className="relative h-16">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
      </div>
    </div>
  )
}