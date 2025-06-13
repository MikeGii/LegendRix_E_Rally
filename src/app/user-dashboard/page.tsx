'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserDashboard } from '@/components/UserDashboard'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function UserDashboardPage() {
  console.log('🔧 UserDashboardPage - Component loaded')
  
  return (
    <ProtectedRoute>
      {/* REMOVED requiredRole - Now both admin and user can access */}
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}