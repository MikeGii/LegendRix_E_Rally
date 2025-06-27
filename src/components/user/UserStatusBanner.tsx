// src/components/user/UserStatusBanner.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
interface StatusMessage {
  type: 'success' | 'warning' | 'info'
  message: string
  icon: string
  color: 'green' | 'yellow' | 'blue'
}

interface UserStatusBannerProps {
  status: StatusMessage
}

export function UserStatusBanner({ status }: UserStatusBannerProps) {
  // Map colors to futuristic theme
  const getThemeStyles = (color: string) => {
    switch (color) {
      case 'green':
        return {
          border: 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]',
          bg: 'bg-gradient-to-r from-green-900/20 to-green-800/10',
          icon: 'bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30',
          text: 'text-green-400',
          glow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
          pulse: 'bg-green-500'
        }
      case 'yellow':
        return {
          border: 'border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.3)]',
          bg: 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/10',
          icon: 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30',
          text: 'text-yellow-400',
          glow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
          pulse: 'bg-yellow-500'
        }
      case 'blue':
        return {
          border: 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
          bg: 'bg-gradient-to-r from-purple-900/20 to-blue-900/10',
          icon: 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/30',
          text: 'text-purple-400',
          glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
          pulse: 'bg-purple-500'
        }
      default:
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gradient-to-r from-gray-900/20 to-gray-800/10',
          icon: 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border border-gray-500/30',
          text: 'text-gray-400',
          glow: '',
          pulse: 'bg-gray-500'
        }
    }
  }

  const styles = getThemeStyles(status.color)

  return (
    <div className={`tech-border rounded-2xl ${styles.border} ${styles.bg} backdrop-blur-xl p-6 relative overflow-hidden`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.01] pointer-events-none"></div>
      
      {/* Scanning effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute w-full h-0.5 ${styles.pulse} opacity-20 -top-px animate-scan-line`}></div>
      </div>
      
      <div className="relative z-10 flex items-center space-x-4">
        {/* Icon with futuristic frame */}
        <div className="relative">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${styles.icon} ${styles.glow} backdrop-blur-sm`}>
            <span className="text-2xl relative z-10">{status.icon}</span>
            
            {/* Pulse effect */}
            <div className={`absolute inset-0 rounded-xl ${styles.pulse} opacity-20 animate-pulse`}></div>
          </div>
          
          {/* Status indicator */}
          <div className={`absolute -top-1 -right-1 w-3 h-3 ${styles.pulse} rounded-full animate-pulse ${styles.glow}`}></div>
        </div>
        
        {/* Message content */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <p className={`font-bold ${styles.text} font-['Orbitron'] uppercase tracking-wider text-sm`}>
              {status.type === 'success' ? 'EDUKAS' : 
               status.type === 'warning' ? 'HOIATUS' : 
               'TEADE'}
            </p>
            <div className={`h-px flex-1 bg-gradient-to-r from-${status.color}-500/30 via-transparent to-transparent`}></div>
          </div>
          <p className="text-gray-300 mt-1">
            {status.message}
          </p>
        </div>
        
        {/* Action indicator */}
        <div className="flex items-center">
          <div className={`px-3 py-1 rounded-lg ${styles.bg} border ${styles.border} backdrop-blur-sm`}>
            <span className={`text-xs font-['Orbitron'] ${styles.text} uppercase tracking-wider`}>
              {status.type === 'warning' ? 'Vajalik tegevus' : 'Oleku info'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${status.color}-500/30 to-transparent`}></div>
    </div>
  )
}