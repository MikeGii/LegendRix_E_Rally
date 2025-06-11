// src/components/AdminDashboard.tsx
'use client'

import { useUserStats } from '@/hooks/useOptimizedUsers'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminQuickActions } from '@/components/admin/AdminQuickActions'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'

export function AdminDashboard() {
  // Data Hooks
  const userStats = useUserStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header Section */}
        <AdminHeader 
          userStats={userStats}
          isLoading={false}
          onRefresh={() => {}} // No refresh needed since we're not loading users here
        />

        {/* Quick Action Bar */}
        <AdminQuickActions />

        {/* Stats Cards */}
        <AdminStatsCards stats={userStats} />

        {/* System Overview */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">System Overview</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Recent Activity */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                <span>📊</span>
                <span>Recent Activity</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">New registrations today</span>
                  <span className="text-blue-400 font-medium">0</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Users pending approval</span>
                  <span className="text-yellow-400 font-medium">{userStats.pendingApproval}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-300">Total approved users</span>
                  <span className="text-green-400 font-medium">{userStats.approved}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                <span>🔗</span>
                <span>Quick Links</span>
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/user-management'}
                  className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all duration-200"
                >
                  👥 User Management
                </button>
                <button className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all duration-200">
                  🏁 Rally Management
                </button>
                <button className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all duration-200">
                  📊 System Analytics
                </button>
                <button className="w-full text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all duration-200">
                  ⚙️ System Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to LegendRix E-Rally Admin Panel</h2>
            <p className="text-slate-300 mb-6">
              Manage your rally championship system efficiently. Monitor user registrations, 
              oversee rally events, and maintain the competitive integrity of your platform.
            </p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => window.location.href = '/user-management'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                Manage Users
              </button>
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}