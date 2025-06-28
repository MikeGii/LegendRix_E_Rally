// src/app/admin-dashboard/page.tsx - Admin Dashboard Page
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SmartDashboard } from '@/components/SmartDashboard'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function AdminDashboardPage() {
  console.log('🔧 AdminDashboardPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <SmartDashboard />
      </DashboardLayout>
    </ProtectedRoute>
  )
}