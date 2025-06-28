// src/app/user-settings/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserSettings } from '@/components/user/UserSettings'
import { DashboardLayout } from '@/components/DashboardLayout'


export default function UserSettingsPage() {
  return (
    <ProtectedRoute>
        <DashboardLayout>
          <UserSettings />
        </DashboardLayout>
    </ProtectedRoute>
  )
}