'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RallyRegistration } from '@/components/registration/RallyRegistration'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function RegistrationPage() {
  console.log('🔧 RegistrationPage - Component loaded')
  
  return (
    <ProtectedRoute>
      {/* REMOVED requiredRole="user" - Now both admin and user can access */}
      <DashboardLayout>
        <RallyRegistration />
      </DashboardLayout>
    </ProtectedRoute>
  )
}