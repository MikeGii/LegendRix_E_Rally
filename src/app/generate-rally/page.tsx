// src/app/generate-rally/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'

export default function GenerateRallyPage() {
  console.log('🎲 GenerateRallyPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Unified Admin Header */}
          <AdminPageHeader
            title="Genereeri mulle ralli!"
            description="Genereeri automaatselt uus ralli"
            icon="🎲"
            stats={[]}
            actions={[]}
          />
          
          {/* Content will be added in future updates */}
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <span className="text-4xl">🎲</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ralli generaator</h2>
              <p className="text-slate-400">Funktsioon on arendamisel...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}