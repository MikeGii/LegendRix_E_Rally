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
        <div className="flex space-x-4">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔄</span>
                <span>Refresh Data</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}