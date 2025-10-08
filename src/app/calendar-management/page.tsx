// src/app/calendar-management/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { CalendarManagement } from '@/components/CalendarManagement'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function CalendarManagementPage() {
  console.log('🔧 CalendarManagementPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <CalendarManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}