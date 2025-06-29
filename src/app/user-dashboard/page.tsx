'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserDashboard } from '@/components/UserDashboard'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function UserDashboardPage() {
  console.log('🔧 UserDashboardPage - Component loaded')
  
  return (
    <ProtectedRoute requireApproval={false}>
      {/* Allow access without approval so users can see their pending status */}
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}