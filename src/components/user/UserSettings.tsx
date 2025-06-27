// src/components/user/UserSettings.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { ProfileTab } from './settings/ProfileTab'
import { AccountTab } from './settings/AccountTab'
import { PasswordTab } from './settings/PasswordTab'

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
      color: 'red' as const
    },
    {
      id: 'account' as SettingsSection,
      icon: '⚙️',
      title: 'Kasutaja andmed',
      description: 'Muuda oma nime ja e-maili',
      color: 'gray' as const
    },
    {
      id: 'password' as SettingsSection,
      icon: '🔐',
      title: 'Parooli muutmine',
      description: 'Uuenda oma parooli',
      color: 'gray' as const
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
            <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-gray-500/20 border-b-gray-500 rounded-full animate-spin" 
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-gradient-to-r from-red-400 via-white to-gray-400 bg-clip-text font-['Orbitron'] uppercase tracking-wider mb-4">
            Kasutaja sätted
          </h1>
          <p className="text-xl text-gray-400 font-['Orbitron']">
            Halda oma konto informatsiooni ja eelistusi
          </p>
          <div className="h-px bg-gradient-to-r from-red-500/50 via-gray-500/30 to-transparent mt-4"></div>
        </div>

        {/* Settings Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="tech-border rounded-2xl shadow-[0_0_20px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
              
              <h2 className="text-lg font-bold text-white mb-6 font-['Orbitron'] uppercase tracking-wider relative z-10">Sätted</h2>
              
              <nav className="space-y-2 relative z-10">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden
                      ${activeSection === section.id
                        ? 'bg-gradient-to-r from-red-900/30 to-gray-900/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(255,0,64,0.3)]'
                        : 'hover:bg-gray-900/50 text-gray-400 hover:text-red-400 border-gray-800 hover:border-red-500/30'
                      }
                    `}
                  >
                    {/* Hover sweep effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <div className="relative z-10 flex items-center space-x-3">
                      <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                        {section.icon}
                      </span>
                      <div>
                        <p className="font-bold font-['Orbitron'] uppercase tracking-wider text-sm">{section.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                      </div>
                    </div>
                    
                    {activeSection === section.id && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,64,0.8)]"></div>
                      </div>
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Bottom gradient line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.2)] bg-black/80 backdrop-blur-xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
              
              {/* Message Display */}
              {message && (
                <div className={`
                  relative z-10 mb-6 p-4 rounded-xl border backdrop-blur-sm
                  ${message.type === 'success'
                    ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                    : message.type === 'warning'
                    ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-500/30 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                    : 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                  }
                `}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">
                      {message.type === 'success' ? '✅' : 
                       message.type === 'warning' ? '⚠️' : '❌'}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold font-['Orbitron'] uppercase tracking-wider text-sm mb-1">
                        {message.type === 'success' ? 'EDUKAS' : 
                         message.type === 'warning' ? 'HOIATUS' : 'VIGA'}
                      </p>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Section Content */}
              <div className="relative z-10">
                {renderActiveSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}