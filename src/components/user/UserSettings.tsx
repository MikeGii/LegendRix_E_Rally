// src/components/user/UserSettings.tsx
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
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile') // Start with profile tab
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
      description: 'Vaata oma ralli profiili'
    },
    {
      id: 'account' as SettingsSection,
      icon: '⚙️',
      title: 'Kasutaja andmed',
      description: 'Muuda oma nime ja e-maili'
    },
    {
      id: 'password' as SettingsSection,
      icon: '🔐',
      title: 'Parooli muutmine',
      description: 'Uuenda oma parooli'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Sätete laadimine...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Juurdepääs keelatud</h2>
          <p className="text-slate-400">Palun logi sisse, et pääseda juurde sätetele.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">Kasutaja sätted</h1>
          <p className="text-xl text-slate-300 drop-shadow-lg">
            Halda oma konto informatsiooni ja eelistusi
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Sätted</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-200 group
                      ${activeSection === section.id
                        ? 'bg-blue-600/20 border-blue-400/40 text-blue-300'
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        {section.icon}
                      </span>
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              {/* Message Display */}
              {message && (
                <div className={`
                  mb-6 p-4 rounded-xl border
                  ${message.type === 'success'
                    ? 'bg-green-900/50 border-green-700/50 text-green-300'
                    : message.type === 'warning'
                    ? 'bg-yellow-900/50 border-yellow-700/50 text-yellow-300'
                    : 'bg-red-900/50 border-red-700/50 text-red-300'
                  }
                `}>
                  <div className="flex items-center space-x-2">
                    <span>
                      {message.type === 'success' ? '✅' : 
                       message.type === 'warning' ? '⚠️' : '❌'}
                    </span>
                    <span>{message.text}</span>
                  </div>
                </div>
              )}

              {/* Active Section Content */}
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}