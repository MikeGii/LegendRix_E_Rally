// src/components/registration/RallyRegistration.tsx - Updated with Unified Theme
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useUpcomingRallies } from '@/hooks/useOptimizedRallies'
import { RegistrationFormWithClasses } from './RegistrationFormWithClasses'
import { RallyDetails } from './RallyDetails'
import { TransformedRally } from '@/hooks/useOptimizedRallies'

export function RallyRegistration() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get all rallies to find the selected one
  const { data: allRallies = [] } = useUpcomingRallies(50)

  // Check if coming from a specific rally (prefill scenario)
  const preselectedRallyId = searchParams.get('rallyId')

  useEffect(() => {
    if (preselectedRallyId && allRallies.length > 0) {
      const rally = allRallies.find(r => r.id === preselectedRallyId)
      if (rally) {
        setSelectedRally(rally)
      } else {
        console.warn('Rally not found:', preselectedRallyId)
        setSelectedRally(null)
      }
    }
  }, [preselectedRallyId, allRallies])

  const handleRegistrationComplete = () => {
    console.log('Registration completed!')
    router.push('/user-dashboard')
  }

  const handleCancel = () => {
    router.push('/user-dashboard')
  }

  const handleRallySelect = (rally: TransformedRally) => {
    setSelectedRally(rally)
    router.replace(`/registration?rallyId=${rally.id}`)
  }

  const handleBackToSelection = () => {
    setSelectedRally(null)
    router.replace('/registration')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Unified Header with Rally Cover Background */}
        <div className="relative">
          <div className="relative bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Background image */}
            <div 
              className="absolute inset-0 opacity-10 bg-cover bg-center"
              style={{
                backgroundImage: `url(/image/rally-cover.png)`,
                filter: 'blur(1px)'
              }}
            />
            
            {/* Content overlay */}
            <div className="relative z-10 p-8">
              {/* Header section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 text-slate-300 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-600/50"
                  >
                    <span>←</span>
                    <span>Tagasi kasutaja töölauale</span>
                  </button>
                  
                  {/* Rally cover icon */}
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30 backdrop-blur-sm">
                    <img 
                      src="/image/rally-cover.png" 
                      alt="Rally Cover"
                      className="w-8 h-8 object-cover rounded-lg opacity-80"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <span className="text-green-400 text-xl hidden">📝</span>
                  </div>
                </div>

                {/* Additional rally navigation if selected */}
                {selectedRally && (
                  <button
                    onClick={handleBackToSelection}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-lg font-medium transition-all duration-200 backdrop-blur-sm"
                  >
                    Vali teine ralli
                  </button>
                )}
              </div>

              {/* Title and description */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">📝</span>
                  <h1 className="text-3xl font-bold text-white">Ralli registreerimine</h1>
                </div>
                <p className="text-slate-300 text-lg">
                  {selectedRally 
                    ? `Registreeru: ${selectedRally.name}`
                    : 'Vali ralli, millele soovid registreeruda'
                  }
                </p>
              </div>

              {/* Rally status indicator */}
              {selectedRally && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-slate-300">
                      Registreerimine avatud: {new Date(selectedRally.registration_deadline).toLocaleDateString('et-EE')} välja
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-sm text-slate-300">
                      Osalejaid: {selectedRally.registered_participants || 0}
                      {selectedRally.max_participants && ` / ${selectedRally.max_participants}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedRally ? (
          // Show rally details and registration form for selected rally
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Rally Details */}
            <div className="space-y-6">
              <RallyDetails rally={selectedRally} />
            </div>

            {/* Registration Form */}
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 text-xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Registreerimine</h2>
                    <p className="text-slate-400">Vali klass ja registreeru</p>
                  </div>
                </div>
                
                <RegistrationFormWithClasses
                  rallyId={selectedRally.id}
                  rallyName={selectedRally.name}
                  onSuccess={handleRegistrationComplete}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        ) : (
          // Show rally selection grid
          <RallySelectionGrid 
            rallies={allRallies}
            onRallySelect={handleRallySelect}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

// Component for selecting a rally when none is preselected
interface RallySelectionGridProps {
  rallies: TransformedRally[]
  onRallySelect: (rally: TransformedRally) => void
  isLoading: boolean
}

function RallySelectionGrid({ rallies, onRallySelect, isLoading }: RallySelectionGridProps) {
  // Filter only open rallies
  const openRallies = rallies.filter(rally => {
    const now = new Date()
    const deadline = new Date(rally.registration_deadline)
    return (rally.status === 'registration_open' || rally.status === 'upcoming') && deadline > now
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Tulemas'
      case 'registration_open': return 'Registreerimine avatud'
      case 'registration_closed': return 'Registreerimine suletud'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Laadin saadaolevaid rallieid...</p>
        </div>
      </div>
    )
  }

  if (openRallies.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Registreerumiseks rallieid pole</h3>
          <p className="text-slate-400 mb-6">
            Hetkel pole aktiivseid rallieid, millele saaks registreeruda.
          </p>
          <p className="text-slate-500 text-sm">
            Uued rallid lisatakse peagi. Kontrolli hiljem uuesti!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selection header */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <span className="text-blue-400 text-xl">🏁</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Vali ralli</h2>
            <p className="text-slate-400">Kliki rallile, millele soovid registreeruda</p>
          </div>
        </div>
      </div>

      {/* Rallies grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {openRallies.map((rally) => (
          <div
            key={rally.id}
            onClick={() => onRallySelect(rally)}
            className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-200 cursor-pointer group"
          >
            {/* Rally Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 text-lg">🏁</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {rally.name}
                  </h3>
                  <p className="text-sm text-slate-400">{rally.game_name}</p>
                </div>
              </div>

              {rally.is_featured && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                  ⭐ ESILETÕSTETUD
                </span>
              )}
            </div>

            {/* Rally Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">🎮</span>
                <span className="text-slate-300">{rally.game_type_name}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">📅</span>
                <span className="text-slate-300">
                  {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">⏰</span>
                <span className="text-slate-300">
                  Registreerimine kuni {new Date(rally.registration_deadline).toLocaleDateString('et-EE')}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">👥</span>
                <span className="text-slate-300">
                  {rally.registered_participants || 0}
                  {rally.max_participants && ` / ${rally.max_participants}`} osalejat
                </span>
              </div>
            </div>

            {/* Rally Status */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                {getStatusText(rally.status)}
              </span>
              
              <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
                <span className="text-sm font-medium">Registreeru →</span>
              </div>
            </div>

            {/* Description preview */}
            {rally.description && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-slate-400 text-sm line-clamp-2">
                  {rally.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}