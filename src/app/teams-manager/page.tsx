// src/app/teams-manager/page.tsx
'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ViewProvider } from '@/components/ViewProvider'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { TeamCreationForm } from '@/components/teams/TeamCreationForm'
import { TeamsList } from '@/components/teams/TeamsList'
import { PendingApplicationsSection } from '@/components/teams/PendingApplicationsSection'

export default function TeamsManagerPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <ProtectedRoute requiredRole="admin">
      <ViewProvider>
        <DashboardLayout>
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Admin Page Header */}
            <AdminPageHeader
              title="Tiimipealikute Manageerimine"
              description="Halda tiimide pealikuid ja õigusi"
              icon="👥"
            />

            {/* Create Team Section */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Loo uus tiim</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <span>{showCreateForm ? '−' : '+'}</span>
                  <span>{showCreateForm ? 'Peida vorm' : 'Näita vormi'}</span>
                </button>
              </div>

              {showCreateForm && <TeamCreationForm />}
            </div>

            {/* Teams List */}
            <TeamsList />

            {/* Pending Applications Section */}
            <PendingApplicationsSection />
          </div>
        </DashboardLayout>
      </ViewProvider>
    </ProtectedRoute>
  )
}