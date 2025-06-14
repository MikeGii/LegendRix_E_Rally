// src/components/admin/AdminQuickActions.tsx - Modern Estonian Quick Actions
export function AdminQuickActions() {
  const actions = [
    {
      title: 'Kasutajate haldamine',
      description: 'Halda kasutajakontosid ja õigusi',
      icon: '👥',
      color: 'blue',
      href: '/user-management',
      gradient: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      hover: 'hover:border-blue-400/50',
      shadow: 'hover:shadow-blue-500/25'
    },
    {
      title: 'Mängude haldamine',
      description: 'Lisa ja halda mänge',
      icon: '🎮',
      color: 'purple',
      href: '/game-management',
      gradient: 'from-purple-500/20 to-purple-600/20',
      border: 'border-purple-500/30',
      hover: 'hover:border-purple-400/50',
      shadow: 'hover:shadow-purple-500/25'
    },
    {
      title: 'Rallide haldamine',
      description: 'Loo ja halda rallisid ning võistlusi',
      icon: '🏁',
      color: 'green',
      href: '/rally-management',
      gradient: 'from-green-500/20 to-green-600/20',
      border: 'border-green-500/30',
      hover: 'hover:border-green-400/50',
      shadow: 'hover:shadow-green-500/25'
    },
    {
      title: 'Toetamised',
      description: 'Halda sponsoreid ja toetajaid',
      icon: '💝',
      color: 'orange',
      href: '/sponsors',
      gradient: 'from-orange-500/20 to-orange-600/20',
      border: 'border-orange-500/30',
      hover: 'hover:border-orange-400/50',
      shadow: 'hover:shadow-orange-500/25'
    }
  ]

  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Kiirtegevused</h2>
        <p className="text-slate-400">Ligi pääs peamistele haldus funktsioonidele</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={() => handleNavigation(action.href)}
            className={`
              group p-6 bg-gradient-to-br ${action.gradient} 
              backdrop-blur-xl border ${action.border} ${action.hover}
              rounded-2xl transition-all duration-300 hover:scale-105 
              hover:shadow-xl ${action.shadow} text-left
            `}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-2xl">{action.icon}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors duration-200">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Action Arrow */}
            <div className="flex justify-end mt-4">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                <span className="text-xs text-white">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}