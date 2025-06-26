// src/app/teams/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ViewProvider } from '@/components/ViewProvider'
import { TeamHeaderSection } from '@/components/teams/TeamHeaderSection'

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <ViewProvider>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Page Header */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                  <span>👥</span>
                  <span>Tiimid</span>
                </h1>
                <p className="text-slate-400 mt-2">
                  Siin saad näha oma tiimiga seonduvat
                </p>
              </div>
            </div>

            {/* Team Header Section Component */}
            <TeamHeaderSection />
          </div>
        </DashboardLayout>
      </ViewProvider>
    </ProtectedRoute>
  )
}