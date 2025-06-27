// src/components/player/PublicPlayerProfileModal.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePublicPlayerProfile } from '@/hooks/usePublicPlayerProfile'
import { usePlayerTeam } from '@/hooks/usePlayerTeam'
import { useUserStatistics } from '@/hooks/useUserStatistics'
import { useUserAchievements } from '@/hooks/useUserAchievements'
import { UserStatistics } from '@/components/user/statistics/UserStatistics'
import { UserAchievements } from '@/components/user/achievements/UserAchievements'

type ProfileSection = 'statistics' | 'achievements'

interface PublicPlayerProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  anchorElement?: HTMLElement | null
}

export function PublicPlayerProfileModal({ 
  userId, 
  isOpen, 
  onClose,
  anchorElement 
}: PublicPlayerProfileModalProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>('statistics')
  const modalRef = useRef<HTMLDivElement>(null)

  // Load profile by userId (secure)
  const { data: player, isLoading: playerLoading } = usePublicPlayerProfile(userId)
  const { data: teamData, isLoading: teamLoading } = usePlayerTeam(userId)
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        // Restore scroll
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

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
        return <UserStatistics userId={userId} showRefreshButton={false} />
      case 'achievements':
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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden my-8"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            {/* Left side - Player info */}
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

            {/* Right side - Team info */}
            {teamData && (
              <div className="text-right">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-3">
                  <p className="text-sm text-slate-400 mb-1">Tiim</p>
                  <h3 className="text-lg font-semibold text-white">
                    {teamData.team_name}
                  </h3>
                  {(teamData.vehicle_name || teamData.class_name) && (
                    <p className="text-sm text-slate-300 mt-1">
                      {teamData.vehicle_name && teamData.class_name ? (
                        <>
                          <span className="text-blue-400">{teamData.vehicle_name}</span>
                          <span className="mx-1 text-slate-500">-</span>
                          <span className="text-purple-400">{teamData.class_name}</span>
                        </>
                      ) : teamData.vehicle_name ? (
                        <span className="text-blue-400">{teamData.vehicle_name}</span>
                      ) : (
                        <span className="text-purple-400">{teamData.class_name}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {playerLoading || teamLoading ? (
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
    </div>
  )

  // Use portal to render at document body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}