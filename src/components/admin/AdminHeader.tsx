// src/components/admin/AdminHeader.tsx
import { UserStats } from '@/hooks/useOptimizedUsers'

interface AdminHeaderProps {
  userStats: UserStats
  isLoading: boolean
  onRefresh: () => void
}

export function AdminHeader({ userStats, isLoading, onRefresh }: AdminHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage user registrations and rally system oversight</p>
          <p className="text-xs text-slate-500 mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  )
}