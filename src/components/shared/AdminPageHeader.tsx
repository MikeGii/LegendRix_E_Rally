// src/components/shared/AdminPageHeader.tsx
// Unified Admin Panel Header for all admin pages in Estonian

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
    <div className="relative">
      {/* Rally cover background header */}
      <div className="relative bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(/image/rally-cover.png)`,
            filter: 'blur(1px)'
          }}
        />
        
        {/* Content overlay */}
        <div className="relative z-10 p-8">
          {/* Top section with back button and icon */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToAdmin}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-600/50"
              >
                <span>←</span>
                <span>Tagasi Admin töölauale</span>
              </button>
              
              {/* Rally cover icon */}
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 backdrop-blur-sm">
                <img 
                  src="/image/rally-cover.png" 
                  alt="Rally Cover"
                  className="w-8 h-8 object-cover rounded-lg opacity-80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
                <span className="text-blue-400 text-xl hidden">{icon}</span>
              </div>
            </div>

            {/* Action buttons */}
            {(onRefresh || actions.length > 0) && (
              <div className="flex items-center space-x-3">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 disabled:bg-blue-800/50 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Värskendab...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>🔄</span>
                        <span>Värskenda</span>
                      </div>
                    )}
                  </button>
                )}
                
                {actions.map((action, index) => {
                  const variantClasses = {
                    primary: 'bg-blue-600/80 hover:bg-blue-700/80 text-white shadow-lg hover:shadow-blue-500/25',
                    secondary: 'bg-slate-600/80 hover:bg-slate-700/80 text-white',
                    success: 'bg-green-600/80 hover:bg-green-700/80 text-white shadow-lg hover:shadow-green-500/25'
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={action.loading}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 backdrop-blur-sm ${variantClasses[action.variant || 'primary']}`}
                    >
                      {action.loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {action.icon && <span>{action.icon}</span>}
                          <span>{action.label}</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Title and description */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{icon}</span>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-slate-300 text-lg">{description}</p>
          </div>

          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-6">
              {stats.map((stat, index) => {
                const colorClasses = {
                  blue: 'bg-blue-500',
                  green: 'bg-green-500', 
                  yellow: 'bg-yellow-500',
                  red: 'bg-red-500'
                }
                
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${colorClasses[stat.color || 'blue']}`}></span>
                    <span className="text-sm text-slate-300">
                      {stat.label}: <span className="font-medium text-white">{stat.value}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}