// src/components/user/settings/ProfileTab.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { UserStatistics } from '../statistics/UserStatistics'
import { UserAchievements } from '../achievements/UserAchievements'

type ProfileSection = 'statistics' | 'achievements'

export function ProfileTab() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<ProfileSection>('statistics')

  const profileSections = [
    {
      id: 'statistics' as ProfileSection,
      icon: '📊',
      title: 'Statistika',
      description: 'Osalemise andmed',
      accentColor: 'text-purple-500',
      bgGradient: 'from-purple-900/30 to-purple-800/20',
      borderColor: 'border-purple-500/30',
      activeBg: 'bg-gradient-to-r from-purple-900/30 to-purple-800/20'
    },
    {
      id: 'achievements' as ProfileSection,
      icon: '🏆',
      title: 'Saavutused',
      description: 'Märgid ja auhinnad',
      accentColor: 'text-orange-500',
      bgGradient: 'from-orange-900/30 to-orange-800/20',
      borderColor: 'border-orange-500/30',
      activeBg: 'bg-gradient-to-r from-orange-900/30 to-orange-800/20'
    }
  ]

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'statistics':
        return <UserStatistics userId={user?.id} showRefreshButton={true} />
      case 'achievements':
        return <UserAchievements userId={user?.id} />
      default:
        return <UserStatistics userId={user?.id} showRefreshButton={true} />
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-black text-white mb-8 font-['Orbitron'] uppercase tracking-wider">
        <span className="text-red-500">⬢</span> Minu profiil
      </h3>
      
      {/* Main Profile Card - Futuristic Design */}
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl p-8 text-center mb-8 overflow-hidden tech-border">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-32 h-32 gradient-orb gradient-orb-red opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 gradient-orb gradient-orb-purple opacity-10"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Profile Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-red-900/50 to-orange-900/30 border border-red-500/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,0,64,0.3)]">
            <span className="text-2xl font-black text-white font-['Orbitron']">
              {user?.player_name ? user.player_name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          
          {/* Player Name */}
          <h4 className="text-2xl font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-glow-red">{user?.player_name || 'Mängijanimi pole määratud'}</span>
          </h4>
          
          {/* Account Name */}
          <p className="text-base text-gray-400 font-['Orbitron']">
            {user?.name || 'Konto nimi pole määratud'}
          </p>
          
          {/* User ID Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-black/50 border border-gray-700/50 rounded-full">
            <span className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">ID:</span>
            <span className="text-xs text-gray-400 font-mono">{user?.id?.slice(0, 8)}...</span>
          </div>
        </div>
      </div>

      {/* Profile Sections Navigation */}
      <div className="mb-6">
        <div className="flex gap-3">
          {profileSections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex-1 flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300 
                  tech-border group relative overflow-hidden
                  ${isActive
                    ? `${section.activeBg} ${section.borderColor} shadow-[0_0_20px_rgba(139,0,255,0.3)]`
                    : 'bg-gray-900/30 border-gray-700/50 hover:border-gray-600/50'
                  }
                `}
              >
                <span className={`text-2xl ${isActive ? section.accentColor : 'text-gray-500'}`}>
                  {section.icon}
                </span>
                <div className="text-left">
                  <p className={`font-bold text-sm font-['Orbitron'] uppercase tracking-wider ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}>
                    {section.title}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    isActive ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {section.description}
                  </p>
                </div>
                
                {isActive && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${section.accentColor.replace('text-', 'bg-')} animate-pulse`}></div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl overflow-hidden tech-border">
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              activeSection === 'statistics' 
                ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30' 
                : 'bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30'
            }`}>
              <span className={`text-xl ${
                activeSection === 'statistics' ? 'text-purple-400' : 'text-orange-400'
              }`}>
                {profileSections.find(s => s.id === activeSection)?.icon}
              </span>
            </div>
            <h5 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
              {profileSections.find(s => s.id === activeSection)?.title}
            </h5>
          </div>
          
          {renderActiveSection()}
        </div>
      </div>
    </div>
  )
}