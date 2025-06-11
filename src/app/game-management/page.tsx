// src/app/game-management/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { GameManagement } from '@/components/GameManagement'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function GameManagementPage() {
  console.log('🔧 GameManagementPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <GameManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}