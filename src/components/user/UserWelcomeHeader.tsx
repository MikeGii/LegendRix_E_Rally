// src/components/user/UserWelcomeHeader.tsx
interface UserWelcomeHeaderProps {
  userName: string
  isAdminAsUser: boolean
}

export function UserWelcomeHeader({ userName, isAdminAsUser }: UserWelcomeHeaderProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            isAdminAsUser ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30' : 'bg-blue-500/20'
          }`}>
            <span className="text-blue-400 text-2xl font-bold">
              {isAdminAsUser ? '👑' : userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome, {userName}!
              {isAdminAsUser && <span className="text-purple-400 ml-2">(Admin)</span>}
            </h1>
            <p className="text-slate-400 mt-1">
              {isAdminAsUser ? 'Administrator • Driver Mode' : 'E-WRC Rally Championship'}
            </p>
          </div>
        </div>
        
        {/* Admin Badge */}
        {isAdminAsUser && (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">👑</span>
              <span className="text-purple-300 font-medium">Admin Driver</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}