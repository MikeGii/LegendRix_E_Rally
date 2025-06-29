// src/components/shared/AdminPageHeader.tsx
// Unified Admin Panel Header for all admin pages in Estonian - Futuristic Black-Red Theme

interface AdminPageHeaderProps {
  title: string
  description: string
  icon: string
  stats?: {
    label: string
    value: number | string
    color?: 'blue' | 'green' | 'yellow' | 'red'
  }[]
  actions?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'success'
    loading?: boolean
    icon?: string
  }[]
  onRefresh?: () => void
  isLoading?: boolean
}

export function AdminPageHeader({ 
  title, 
  description, 
  icon,
  stats = [],
  actions = [],
  onRefresh,
  isLoading = false
}: AdminPageHeaderProps) {
  const handleBackToAdmin = () => {
    window.location.href = '/admin-dashboard'
  }

  return (
    <div className="relative mb-8">
      {/* Futuristic Background Container */}
      <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-red-900/20 overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(220,38,38,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(220,38,38,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-800/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          
          {/* Scan Line Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
              style={{
                animation: 'scan 4s linear infinite',
                top: '0%'
              }}
            />
          </div>
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500/50 to-transparent" />
            <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-red-500/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32">
            <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-red-500/50 to-transparent" />
            <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-red-500/50 to-transparent" />
          </div>
        </div>
        
        {/* Content Container */}
        <div className="relative z-10 p-8">
          {/* Top Navigation Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Back Button - Futuristic Style */}
              <button
                onClick={handleBackToAdmin}
                className="group flex items-center space-x-2 px-5 py-2.5 bg-black/60 hover:bg-red-950/40 text-gray-400 hover:text-red-400 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-900/20 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                <span className="text-red-500 group-hover:text-red-400 transition-colors">←</span>
                <span className="font-medium">Tagasi Admin töölauale</span>
              </button>
              
              {/* Icon Badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-xl" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-red-900/40 to-black/60 rounded-xl flex items-center justify-center border border-red-500/30 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(220,38,38,0.2)]">
                  <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">{icon}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(onRefresh || actions.length > 0) && (
              <div className="flex items-center space-x-3">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-900/40 to-red-800/40 hover:from-red-800/50 hover:to-red-700/50 disabled:from-gray-800/40 disabled:to-gray-700/40 text-white rounded-xl transition-all duration-300 font-medium shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50 backdrop-blur-sm border border-red-500/20 hover:border-red-400/30 disabled:border-gray-600/20"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-400 rounded-full animate-spin"></div>
                        <span>Värskendab...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-400">⟳</span>
                        <span>Värskenda</span>
                      </div>
                    )}
                  </button>
                )}
                
                {actions.map((action, index) => {
                  const variantClasses = {
                    primary: 'bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500/90 hover:to-red-600/90 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] border-red-500/30 hover:border-red-400/40',
                    secondary: 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 hover:from-gray-700/70 hover:to-gray-600/70 text-gray-200 border-gray-600/30 hover:border-gray-500/40',
                    success: 'bg-gradient-to-r from-green-900/60 to-green-800/60 hover:from-green-800/70 hover:to-green-700/70 text-green-100 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] border-green-600/30 hover:border-green-500/40'
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={action.loading}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 backdrop-blur-sm border ${variantClasses[action.variant || 'primary']}`}
                    >
                      {action.loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {action.icon && <span className="filter drop-shadow-[0_0_4px_rgba(220,38,38,0.5)]">{action.icon}</span>}
                          <span>{action.label}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-2 tracking-tight">
              {title}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
          </div>

          {/* Stats Section */}
          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-6">
              {stats.map((stat, index) => {
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
                  green: 'from-green-500 to-green-600 shadow-green-500/30', 
                  yellow: 'from-yellow-500 to-yellow-600 shadow-yellow-500/30',
                  red: 'from-red-500 to-red-600 shadow-red-500/30'
                }
                
                const bgColorClasses = {
                  blue: 'bg-blue-950/30 border-blue-500/20',
                  green: 'bg-green-950/30 border-green-500/20',
                  yellow: 'bg-yellow-950/30 border-yellow-500/20',
                  red: 'bg-red-950/30 border-red-500/20'
                }
                
                return (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 px-4 py-2 rounded-xl backdrop-blur-sm border ${bgColorClasses[stat.color || 'red']} transition-all duration-300 hover:scale-105`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[stat.color || 'red']} shadow-[0_0_10px] animate-pulse`} />
                    <span className="text-sm text-gray-400">
                      {stat.label}: <span className="font-bold text-white ml-1">{stat.value}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  )
}