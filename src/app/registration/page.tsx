// src/app/registration/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RallyRegistration } from '@/components/registration/RallyRegistration'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function RegistrationPage() {
  console.log('🔧 RegistrationPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="user">
      <DashboardLayout>
        <RallyRegistration />
      </DashboardLayout>
    </ProtectedRoute>
  )
}