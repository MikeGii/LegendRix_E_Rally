// src/app/news-management/page.tsx
'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { NewsManagement } from '@/components/NewsManagement'

export default function NewsManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <NewsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}