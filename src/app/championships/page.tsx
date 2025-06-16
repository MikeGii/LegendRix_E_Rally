// src/app/championships/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ChampionshipsManagement } from '@/components/championship/ChampionshipsManagement'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function ChampionshipsPage() {
  console.log('🏆 ChampionshipsPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ChampionshipsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}