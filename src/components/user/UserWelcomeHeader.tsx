// src/components/user/UserWelcomeHeader.tsx - Estonian Translation
import Image from 'next/image'

interface UserWelcomeHeaderProps {
  userName: string
  isAdminAsUser: boolean
}

export function UserWelcomeHeader({ userName, isAdminAsUser }: UserWelcomeHeaderProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 relative overflow-hidden">
      {/* Background Rally Image */}
      <div className="absolute right-4 top-4 bottom-4 w-32 opacity-20 pointer-events-none">
        <div className="relative w-full h-full">
          <Image
            src="/image/rally-cover.png"
            alt="Rally Background"
            fill
            className="object-contain object-center rounded-xl"
            sizes="128px"
            priority={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
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
              Tere tulemast, {userName}!
              {isAdminAsUser && <span className="text-purple-400 ml-2">(Admin)</span>}
            </h1>
            <p className="text-slate-400 mt-1">
              {isAdminAsUser ? 'Administraator • Sõitja režiim' : 'E-WRC Ralli Meistrivõistlused'}
            </p>
          </div>
        </div>
        
        {/* Admin Badge */}
        {isAdminAsUser && (
          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl px-4 py-2 relative z-20">
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">👑</span>
              <span className="text-purple-300 font-medium">Admin - Sõitja</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}