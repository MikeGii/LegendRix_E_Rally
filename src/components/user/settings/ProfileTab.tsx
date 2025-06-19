// src/components/user/settings/ProfileTab.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { UserStatistics } from '../statistics/UserStatistics'

type ProfileSection = 'statistics' | 'achievements' | 'favorites'

export function ProfileTab() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState<ProfileSection>('statistics')

  const profileSections = [
    {
      id: 'statistics' as ProfileSection,
      icon: '📊',
      title: 'Statistika',
      description: 'Osalemise andmed'
    },
    // Future sections (commented out for now)
    // {
    //   id: 'achievements' as ProfileSection,
    //   icon: '🏆',
    //   title: 'Saavutused',
    //   description: 'Märgid ja auhinnad'
    // },
    // {
    //   id: 'favorites' as ProfileSection,
    //   icon: '⭐',
    //   title: 'Lemmikud',
    //   description: 'Lemmik üritused ja rajad'
    // }
  ]

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'statistics':
        return <UserStatistics />
      // Future sections
      // case 'achievements':
      //   return <UserAchievements />
      // case 'favorites':
      //   return <UserFavorites />
      default:
        return <UserStatistics />
    }
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-8">Minu profiil</h3>
      
      {/* Main Profile Card - Elegant Glassmorphism */}
      <div className="relative bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-8 text-center mb-8 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Profile Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-semibold text-white">
              {user?.player_name ? user.player_name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          
          {/* Player Name - Smaller heading */}
          <h4 className="text-2xl font-semibold text-white mb-2">
            {user?.player_name || 'Mängijanimi pole määratud'}
          </h4>
          
          {/* Account Name - Subtle secondary text */}
          <p className="text-base text-slate-300">
            {user?.name || 'Konto nimi pole määratud'}
          </p>
        </div>
      </div>

      {/* Profile Sections Navigation */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {profileSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200
                ${activeSection === section.id
                  ? 'bg-blue-600/20 border border-blue-400/40 text-blue-300'
                  : 'bg-slate-800/20 border border-slate-700/30 text-slate-400 hover:text-slate-300 hover:bg-slate-700/20'
                }
              `}
            >
              <span className="text-lg">{section.icon}</span>
              <div className="text-left">
                <p className="font-medium text-sm">{section.title}</p>
                <p className="text-xs opacity-70">{section.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Content */}
      <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center justify-center">
            <span className="text-blue-300 text-xs">
              {profileSections.find(s => s.id === activeSection)?.icon}
            </span>
          </div>
          <h5 className="text-base font-semibold text-white">
            {profileSections.find(s => s.id === activeSection)?.title}
          </h5>
        </div>
        
        {renderActiveSection()}
      </div>
      
      {/* Future Features Card - Minimal glassmorphism */}
      <div className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 text-center">
        <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg flex items-center justify-center mx-auto mb-2">
          <span className="text-sm text-blue-300">🚀</span>
        </div>
        <h5 className="text-base font-medium text-white mb-1">Rohkem tulekul</h5>
        <p className="text-slate-400 text-xs">
          Saavutused, lemmikud ja muud funktsioonid lisatakse peagi.
        </p>
      </div>
    </div>
  )
}