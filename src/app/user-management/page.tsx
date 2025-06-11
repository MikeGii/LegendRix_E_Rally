// src/app/user-management/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserManagement } from '@/components/UserManagement'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function UserManagementPage() {
  console.log('🔧 UserManagementPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}