// Fixed PublicPlayerProfileModal that passes userId to child components
'use client'

import { useState } from 'react'
import { usePublicPlayerProfile } from '@/hooks/usePublicPlayerProfile'
import { useUserStatistics } from '@/hooks/useUserStatistics'
import { useUserAchievements } from '@/hooks/useUserAchievements'
import { UserStatistics } from '@/components/user/statistics/UserStatistics'
import { UserAchievements } from '@/components/user/achievements/UserAchievements'

type ProfileSection = 'statistics' | 'achievements'

interface PublicPlayerProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function PublicPlayerProfileModal({ 
  userId, 
  isOpen, 
  onClose 
}: PublicPlayerProfileModalProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>('statistics')

  // Load profile by userId (secure)
  const { data: player, isLoading: playerLoading } = usePublicPlayerProfile(userId)
  const { data: statistics, isLoading: statsLoading } = useUserStatistics(userId, { useCache: true })
  const { data: achievements, isLoading: achievementsLoading } = useUserAchievements(userId)

  const profileSections = [
    {
      id: 'statistics' as ProfileSection,
      icon: '📊',
      title: 'Statistika',
      description: 'Osalemise andmed'
    },
    {
      id: 'achievements' as ProfileSection,
      icon: '🏆',
      title: 'Saavutused',
      description: 'Märgid ja auhinnad'
    }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderActiveSection = () => {
    if (!player) return null

    switch (activeSection) {
      case 'statistics':
        // FIXED: Pass userId and hide refresh button for public view
        return <UserStatistics userId={userId} showRefreshButton={false} />
      case 'achievements':
        // FIXED: Pass userId to achievements component (you may need to update this too)
        return <UserAchievements userId={userId} />
      default:
        return <UserStatistics userId={userId} showRefreshButton={false} />
    }
  }

  if (!isOpen) return null

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl flex items-center justify-center">
              <span className="text-xl font-semibold text-white">
                {player?.player_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {player?.player_name || 'Mängija profiil'}
              </h2>
              <p className="text-slate-300">
                Avalik profiil
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {playerLoading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Profiili laadimine...</p>
          </div>
        ) : !player ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-white mb-2">Mängijat ei leitud</h3>
            <p className="text-slate-400">Kasutaja ID-ga "{userId}" ei ole leitud.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile Sections Navigation */}
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

            {/* Active Section Content */}
            <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4">
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
              
              {(statsLoading || achievementsLoading) ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-400 text-sm">Laadimine...</p>
                </div>
              ) : (
                renderActiveSection()
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}