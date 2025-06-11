'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RallyManagement } from '@/components/RallyManagement'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function RallyManagementPage() {
  console.log('🔧 RallyManagementPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <RallyManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}