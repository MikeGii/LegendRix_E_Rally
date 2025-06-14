// src/components/admin/AdminStatsCards.tsx - Modern Estonian Stats
import { UserStats } from '@/hooks/useOptimizedUsers'

interface AdminStatsCardsProps {
  stats: UserStats
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const cards = [
    {
      title: 'Kokku kasutajaid',
      value: stats.totalUsers,
      icon: '👥',
      description: 'Registreeritud kasutajad',
      color: 'blue',
      change: '+0',
      changeType: 'neutral' as const
    },
    {
      title: 'E-mail kinnitamata',
      value: stats.pendingEmail,
      icon: '📧',
      description: 'Ootab e-maili kinnitust',
      color: 'yellow',
      change: `${stats.pendingEmail > 0 ? `${stats.pendingEmail} ootel` : 'Kõik kinnitatud'}`,
      changeType: stats.pendingEmail > 0 ? 'warning' as const : 'success' as const
    },
    {
      title: 'Ootab kinnitust',
      value: stats.pendingApproval,
      icon: '⏳',
      description: 'Vajab admin kinnitust',
      color: 'orange',
      change: `${stats.pendingApproval > 0 ? `${stats.pendingApproval} ootel` : 'Kõik kinnitatud'}`,
      changeType: stats.pendingApproval > 0 ? 'warning' as const : 'success' as const
    },
    {
      title: 'Aktiivsed kasutajad',
      value: stats.approved,
      icon: '✅',
      description: 'Täielik ligipääs',
      color: 'green',
      change: `${Math.round((stats.approved / Math.max(stats.totalUsers, 1)) * 100)}% koguarvust`,
      changeType: 'success' as const
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'from-blue-500/10 to-blue-600/5',
        border: 'border-blue-500/20',
        iconBg: 'bg-blue-500/20',
        iconText: 'text-blue-400',
        valueText: 'text-white',
        hover: 'hover:border-blue-400/30'
      },
      yellow: {
        bg: 'from-yellow-500/10 to-yellow-600/5',
        border: 'border-yellow-500/20',
        iconBg: 'bg-yellow-500/20',
        iconText: 'text-yellow-400',
        valueText: 'text-yellow-400',
        hover: 'hover:border-yellow-400/30'
      },
      orange: {
        bg: 'from-orange-500/10 to-orange-600/5',
        border: 'border-orange-500/20',
        iconBg: 'bg-orange-500/20',
        iconText: 'text-orange-400',
        valueText: 'text-orange-400',
        hover: 'hover:border-orange-400/30'
      },
      green: {
        bg: 'from-green-500/10 to-green-600/5',
        border: 'border-green-500/20',
        iconBg: 'bg-green-500/20',
        iconText: 'text-green-400',
        valueText: 'text-green-400',
        hover: 'hover:border-green-400/30'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getChangeColor = (type: 'success' | 'warning' | 'neutral') => {
    switch (type) {
      case 'success': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'neutral': return 'text-slate-400'
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const colors = getColorClasses(card.color)
        return (
          <div
            key={card.title}
            className={`
              bg-gradient-to-br ${colors.bg} backdrop-blur-xl 
              border ${colors.border} ${colors.hover} rounded-2xl p-6 
              transition-all duration-300 hover:scale-105 hover:shadow-xl
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
                <span className={`text-xl ${colors.iconText}`}>{card.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{card.title}</p>
              </div>
            </div>

            {/* Value */}
            <div className="mb-3">
              <p className={`text-3xl font-bold ${colors.valueText}`}>
                {card.value}
              </p>
              <p className="text-sm text-slate-400 mt-1">{card.description}</p>
            </div>

            {/* Change Indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className={getChangeColor(card.changeType)}>
                {card.change}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}