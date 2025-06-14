// src/components/AdminDashboard.tsx - Modern Estonian Design
'use client'

import { useUserStats } from '@/hooks/useOptimizedUsers'
import { AdminQuickActions } from '@/components/admin/AdminQuickActions'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { AdminSystemOverview } from '@/components/admin/AdminSystemOverview'

export function AdminDashboard() {
  const userStats = useUserStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Quick Action Bar */}
        <AdminQuickActions />

        {/* Stats Cards */}
        <AdminStatsCards stats={userStats} />

        {/* System Overview */}
        <AdminSystemOverview userStats={userStats} />
      </div>
    </div>
  )
}