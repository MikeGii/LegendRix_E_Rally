// src/components/admin/AdminSystemOverview.tsx - Modern Estonian System Overview
import { UserStats } from '@/hooks/useOptimizedUsers'

interface AdminSystemOverviewProps {
  userStats: UserStats
}

export function AdminSystemOverview({ userStats }: AdminSystemOverviewProps) {
  const currentDate = new Date()
  const todayRegistrations = 0 // This would come from actual data
  const thisWeekActivity = 0 // This would come from actual data
  const systemHealth = 'Hea' // This would come from actual monitoring

  // Recent activity mock data - replace with real data
  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'Uus kasutaja registreeris',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: '👤',
      color: 'blue'
    },
    {
      id: 2,
      type: 'user_approved',
      message: 'Kasutaja konto kinnitati',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      icon: '✅',
      color: 'green'
    },
    {
      id: 3,
      type: 'system_update',
      message: 'Süsteem uuendati',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: '🔧',
      color: 'purple'
    }
  ]

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} päev${diffDays > 1 ? 'a' : ''} tagasi`
    } else if (diffHours > 0) {
      return `${diffHours} tund${diffHours > 1 ? 'i' : ''} tagasi`
    } else {
      return 'Äsja'
    }
  }

  const systemMetrics = [
    {
      label: 'Tänased registreerumised',
      value: todayRegistrations,
      icon: '📊',
      color: 'blue'
    },
    {
      label: 'E-maili kinnitust ootab',
      value: userStats.pendingEmail,
      icon: '📧',
      color: userStats.pendingEmail > 0 ? 'yellow' : 'gray'
    },
    {
      label: 'Admin kinnitust ootab',
      value: userStats.pendingApproval,
      icon: '⏳',
      color: userStats.pendingApproval > 0 ? 'orange' : 'gray'
    },
    {
      label: 'Aktiivseid kasutajaid',
      value: userStats.approved,
      icon: '✅',
      color: 'green'
    }
  ]

  const quickLinks = [
    {
      title: 'Kasutajate haldamine',
      description: 'Halda kõiki kasutajakontosid',
      href: '/user-management',
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Toetamised',
      description: 'Sponsorid ja streamline toetajad',
      href: '/sponsors',
      icon: '💝',
      color: 'pink'
    },
    {
      title: 'Mängude haldamine',
      description: 'Lisa ja muuda mänge',
      href: '/game-management',
      icon: '🎮',
      color: 'purple'
    },
    {
      title: 'Ralliде haldamine',
      description: 'Loo ja halda võistlusi',
      href: '/rally-management',
      icon: '🏁',
      color: 'green'
    }
  ]

  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      
      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Hiljutine tegevus (Arendamisel) </h2>
            <p className="text-slate-400 text-sm mt-1">Süsteemi sündmused ja muudatused</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center space-x-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${activity.color === 'blue' ? 'bg-blue-500/20' :
                    activity.color === 'green' ? 'bg-green-500/20' :
                    activity.color === 'purple' ? 'bg-purple-500/20' :
                    'bg-gray-500/20'
                  }
                `}>
                  <span className="text-lg">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-slate-400 text-sm">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-slate-500">📊</span>
              </div>
              <p className="text-slate-400">Täna pole uut tegevust</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}