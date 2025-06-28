// src/components/user/UserSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ProfileTab } from './settings/ProfileTab'
import { AccountTab } from './settings/AccountTab'
import { PasswordTab } from './settings/PasswordTab'
import { SectionDivider } from '@/components/landing/SectionDivider'
import '@/styles/futuristic-theme.css'

type SettingsSection = 'profile' | 'account' | 'password'

interface Message {
  type: 'success' | 'error' | 'warning'
  text: string
}

export function UserSettings() {
  const { user, loading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const [message, setMessage] = useState<Message | null>(null)

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Settings sections configuration
  const settingsSections = [
    {
      id: 'profile' as SettingsSection,
      icon: '👤',
      title: 'Profiil',
      description: 'Vaata oma ralli profiili',
      color: 'red' as const,
      accentColor: 'text-red-500',
      bgGradient: 'from-red-900/30 to-red-800/20',
      borderColor: 'border-red-500/30',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(255,0,64,0.3)]'
    },
    {
      id: 'account' as SettingsSection,
      icon: '⚙️',
      title: 'Kasutaja andmed',
      description: 'Muuda oma nime ja e-maili',
      color: 'purple' as const,
      accentColor: 'text-purple-500',
      bgGradient: 'from-purple-900/30 to-purple-800/20',
      borderColor: 'border-purple-500/30',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(139,0,255,0.3)]'
    },
    {
      id: 'password' as SettingsSection,
      icon: '🔐',
      title: 'Parooli muutmine',
      description: 'Uuenda oma parooli',
      color: 'orange' as const,
      accentColor: 'text-orange-500',
      bgGradient: 'from-orange-900/30 to-orange-800/20',
      borderColor: 'border-orange-500/30',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(255,69,0,0.3)]'
    }
  ]

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileTab />
      case 'account':
        return <AccountTab onMessage={setMessage} />
      case 'password':
        return <PasswordTab onMessage={setMessage} />
      default:
        return <ProfileTab />
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-gray-700 border-b-purple-500 rounded-full animate-spin" 
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider uppercase">Sätete laadimine...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.3)] bg-black/90 backdrop-blur-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-900/50 to-gray-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 font-['Orbitron'] uppercase tracking-wider">Juurdepääs keelatud</h2>
          <p className="text-gray-400">Palun logi sisse, et pääseda juurde sätetele.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header - Futuristic Design */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
        
        {/* Gradient orbs for ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 gradient-orb gradient-orb-red opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 gradient-orb gradient-orb-purple opacity-20"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white font-['Orbitron'] uppercase tracking-wider mb-3">
                <span className="text-glow-red">Kasutaja sätted</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Halda oma konto informatsiooni ja eelistusi
              </p>
            </div>
            
            {/* Back to Dashboard Button */}
            <button
              onClick={() => window.location.href = '/user-dashboard'}
              className="group relative px-6 py-3 futuristic-btn tech-border rounded-xl flex items-center gap-3 overflow-hidden"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <svg className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-white font-['Orbitron'] uppercase tracking-wider text-sm relative z-10">Tagasi töölauale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <SectionDivider variant="z-pattern" />

      {/* Settings Grid */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-red-500/20 overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
            
            <div className="relative z-10 p-6">
              <h2 className="text-lg font-bold text-white mb-6 font-['Orbitron'] uppercase tracking-wider">
                <span className="text-red-500">▣</span> Sätted
              </h2>
              
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        w-full text-left p-4 rounded-xl border transition-all duration-300 
                        group relative overflow-hidden tech-border
                        ${isActive
                          ? `bg-gradient-to-r ${section.bgGradient} ${section.borderColor} ${section.hoverShadow}`
                          : 'bg-gray-900/30 border-gray-700/50 hover:border-gray-600/50'
                        }
                      `}
                    >
                      <div className="relative z-10 flex items-start space-x-3">
                        <span className={`text-2xl ${isActive ? section.accentColor : 'text-gray-500'}`}>
                          {section.icon}
                        </span>
                        <div className="flex-1">
                          <p className={`font-bold text-sm font-['Orbitron'] uppercase tracking-wider ${
                            isActive ? 'text-white' : 'text-gray-300'
                          }`}>
                            {section.title}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isActive ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                      
                      {isActive && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className={`w-2 h-2 rounded-full ${section.accentColor.replace('text-', 'bg-')} animate-pulse`}></div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {/* Message Alert */}
          {message && (
            <div className={`
              relative overflow-hidden rounded-xl p-4 mb-6 backdrop-blur-xl border
              ${message.type === 'success' 
                ? 'bg-gradient-to-r from-green-900/20 to-green-800/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : message.type === 'error'
                  ? 'bg-gradient-to-r from-red-900/20 to-red-800/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  : 'bg-gradient-to-r from-orange-900/20 to-orange-800/10 border-orange-500/30 shadow-[0_0_20px_rgba(255,69,0,0.3)]'
              }
            `}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : '⚠️'}
                </span>
                <p className={`font-medium ${
                  message.type === 'success' ? 'text-green-400' : message.type === 'error' ? 'text-red-400' : 'text-orange-400'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          {/* Active Section Content */}
          <div className="relative bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-xl rounded-2xl border border-gray-700/20 overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
            
            <div className="relative z-10 p-8">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}