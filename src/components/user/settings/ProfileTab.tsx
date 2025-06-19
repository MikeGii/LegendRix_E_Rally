// src/components/user/settings/ProfileTab.tsx
'use client'

import { useAuth } from '@/components/AuthProvider'

export function ProfileTab() {
  const { user } = useAuth()

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Minu profiil</h3>
      
      {/* Simple Profile Display */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8 text-center">
        {/* Profile Avatar */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-white">
            {user?.player_name ? user.player_name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        
        {/* Player Name - Main Display */}
        <h4 className="text-3xl font-bold text-white mb-3">
          {user?.player_name || 'Mängijanimi pole määratud'}
        </h4>
        
        {/* Account Name - Secondary Display */}
        <p className="text-lg text-slate-300 mb-4">
          {user?.name || 'Konto nimi pole määratud'}
        </p>
        
        {/* Profile Status */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-green-400 font-medium">Aktiivne liige</span>
        </div>
      </div>
      
      {/* Future Expansion Notice */}
      <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-xl flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🚀</span>
        </div>
        <h5 className="text-lg font-semibold text-white mb-2">Rohkem tulekul</h5>
        <p className="text-slate-400 text-sm">
          Ralli statistika ja edusammud lisatakse peagi.
        </p>
      </div>
    </div>
  )
}