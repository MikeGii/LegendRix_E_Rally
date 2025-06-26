// src/app/teams-manager/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ViewProvider } from '@/components/ViewProvider'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'

export default function TeamsManagerPage() {
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

            {/* Content Area - Coming Soon */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-5xl">🚧</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Tiimipealikute haldus tuleb varsti!
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Siin saad varsti hallata tiimide pealikuid, määrata õigusi ja jälgida tiimide tegevust.
                </p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ViewProvider>
    </ProtectedRoute>
  )
}