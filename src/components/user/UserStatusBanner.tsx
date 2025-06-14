// src/components/user/UserStatusBanner.tsx - Estonian Compatible
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
  return (
    <div className={`bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 ${
      status.color === 'green' ? 'border-green-500/30' :
      status.color === 'yellow' ? 'border-yellow-500/30' :
      status.color === 'blue' ? 'border-blue-500/30' : ''
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          status.color === 'green' ? 'bg-green-500/20' :
          status.color === 'yellow' ? 'bg-yellow-500/20' :
          status.color === 'blue' ? 'bg-blue-500/20' : 'bg-slate-500/20'
        }`}>
          <span className="text-2xl">{status.icon}</span>
        </div>
        <div className="flex-1">
          <p className={`font-medium ${
            status.color === 'green' ? 'text-green-300' :
            status.color === 'yellow' ? 'text-yellow-300' :
            status.color === 'blue' ? 'text-blue-300' : 'text-slate-300'
          }`}>
            {status.message}
          </p>
        </div>
      </div>
    </div>
  )
}