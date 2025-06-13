import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserSettingsProps {
  user: any
  onUpdateProfile: (data: any) => Promise<{ success: boolean; error?: string }>
}

export function UserSettings({ user, onUpdateProfile }: UserSettingsProps) {
  const [activeSection, setActiveSection] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    player_name: user?.player_name || '',
    email: user?.email || ''
  })
  const router = useRouter()

  const sections = [
    {
      id: 'profile',
      icon: '👤',
      title: 'Profiil',
      description: 'Isikuandmed ja kasutajanimi'
    },
    {
      id: 'notifications',
      icon: '🔔', 
      title: 'Teavitused',
      description: 'E-posti ja rakenduse teavitused'
    },
    {
      id: 'privacy',
      icon: '🔒',
      title: 'Privaatsus',
      description: 'Konto turvalisus ja privaatsus'
    },
    {
      id: 'preferences',
      icon: '🎨',
      title: 'Eelistused', 
      description: 'Teema ja keele seaded'
    }
  ]

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await onUpdateProfile(profileData)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profiil edukalt uuendatud!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Profiili uuendamine ebaõnnestus' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Viga profiili uuendamisel' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Profiili andmed</h3>
        <p className="text-slate-400 text-sm">Halda oma isikuandmeid ja kasutajateavet</p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Täisnimi
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Sisesta oma täisnimi"
          />
        </div>

        {/* Player Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Mängija nimi
          </label>
          <input
            type="text"
            value={profileData.player_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, player_name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Steam, Xbox, PlayStation nimi"
          />
          <p className="text-xs text-slate-500 mt-1">
            Sinu mängimisnimi, mida kuvatakse rallidel
          </p>
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            E-post
          </label>
          <input
            type="email"
            value={profileData.email}
            readOnly
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            E-posti aadress ei ole muudetav
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Salvestamine...</span>
            </div>
          ) : (
            'Salvesta muudatused'
          )}
        </button>
      </div>
    </div>
  )

  const renderComingSoon = (sectionTitle: string) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{sectionTitle}</h3>
      <p className="text-slate-400">
        See funktsioon on arendamisel ja tuleb peagi saadavale
      </p>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'notifications':
        return renderComingSoon('Teavituste seaded')
      case 'privacy':
        return renderComingSoon('Privaatsuse seaded') 
      case 'preferences':
        return renderComingSoon('Kasutaja eelistused')
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 bg-slate-700/50 hover:bg-slate-600/70 rounded-xl transition-all duration-200"
              >
                <span className="text-white">←</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Kasutaja Sätted</h1>
                <p className="text-slate-400 text-sm">Halda oma konto seadeid</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sticky top-24">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group
                      ${activeSection === section.id
                        ? 'bg-blue-600/20 border-blue-400/40 text-blue-300'
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
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
              {/* Message */}
              {message && (
                <div className={`
                  mb-6 p-4 rounded-xl border
                  ${message.type === 'success'
                    ? 'bg-green-900/50 border-green-700/50 text-green-300'
                    : 'bg-red-900/50 border-red-700/50 text-red-300'
                  }
                `}>
                  <div className="flex items-center space-x-2">
                    <span>{message.type === 'success' ? '✅' : '❌'}</span>
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