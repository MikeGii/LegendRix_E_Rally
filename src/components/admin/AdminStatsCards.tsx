// src/components/admin/AdminStatsCards.tsx
import { UserStats } from '@/hooks/useOptimizedUsers'

interface AdminStatsCardsProps {
  stats: UserStats
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Email Pending',
      value: stats.pendingEmail,
      icon: '📧',
      color: 'yellow'
    },
    {
      title: 'Need Approval',
      value: stats.pendingApproval,
      icon: '⏳',
      color: 'orange'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: '✅',
      color: 'green'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: '❌',
      color: 'red'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 hover:bg-slate-800/40 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{card.title}</p>
              <p className={`text-2xl font-bold mt-1 ${
                card.color === 'blue' ? 'text-white' :
                card.color === 'yellow' ? 'text-yellow-400' :
                card.color === 'orange' ? 'text-orange-400' :
                card.color === 'green' ? 'text-green-400' :
                'text-red-400'
              }`}>
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              card.color === 'blue' ? 'bg-blue-500/20' :
              card.color === 'yellow' ? 'bg-yellow-500/20' :
              card.color === 'orange' ? 'bg-orange-500/20' :
              card.color === 'green' ? 'bg-green-500/20' :
              'bg-red-500/20'
            }`}>
              <span className={`text-xl ${
                card.color === 'blue' ? 'text-blue-400' :
                card.color === 'yellow' ? 'text-yellow-400' :
                card.color === 'orange' ? 'text-orange-400' :
                card.color === 'green' ? 'text-green-400' :
                'text-red-400'
              }`}>
                {card.icon}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}