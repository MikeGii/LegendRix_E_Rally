// src/app/participant-linking/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ParticipantLinkingInterface } from '@/components/championship/ParticipantLinkingInterface'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function ParticipantLinkingPage() {
  console.log('🔗 ParticipantLinkingPage - Component loaded')
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ParticipantLinkingInterface />
      </DashboardLayout>
    </ProtectedRoute>
  )
}