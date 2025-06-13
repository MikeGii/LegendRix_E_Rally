'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserSettings } from '@/components/user/UserSettings'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function UserSettingsPage() {
  console.log('🔧 UserSettingsPage - Component loaded')
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserSettings />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
