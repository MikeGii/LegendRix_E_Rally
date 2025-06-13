// src/components/registration/RallyRegistration.tsx - Updated to use RegistrationFormWithClasses
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useUpcomingRallies } from '@/hooks/useOptimizedRallies'
import { RegistrationFormWithClasses } from './RegistrationFormWithClasses'
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
        // Redirect to select a rally if not found
        setSelectedRally(null)
      }
    }
  }, [preselectedRallyId, allRallies])

  const handleRegistrationComplete = () => {
    console.log('Registration completed!')
    // Redirect back to dashboard
    router.push('/user-dashboard')
  }

  const handleCancel = () => {
    router.push('/user-dashboard')
  }

  const handleRallySelect = (rally: TransformedRally) => {
    setSelectedRally(rally)
    // Update URL to reflect selected rally
    router.replace(`/registration?rallyId=${rally.id}`)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-xl">📝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Rally Registration</h1>
                <p className="text-slate-400">
                  {selectedRally 
                    ? `Register for: ${selectedRally.name}`
                    : 'Select a rally to register for competition'
                  }
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/70 text-slate-300 hover:text-white rounded-xl transition-all duration-200"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        {selectedRally ? (
          // Show registration form for selected rally
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <RegistrationFormWithClasses
              rallyId={selectedRally.id}
              rallyName={selectedRally.name}
              onSuccess={handleRegistrationComplete}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          // Show rally selection if no rally is preselected
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

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading available rallies...</p>
        </div>
      </div>
    )
  }

  if (openRallies.length === 0) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl text-slate-500">🏁</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Open Rallies</h3>
          <p className="text-slate-400">There are currently no rallies open for registration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Select a Rally to Register</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {openRallies.map((rally) => (
          <button
            key={rally.id}
            onClick={() => onRallySelect(rally)}
            className="text-left p-6 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🏁</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{rally.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{rally.game_name} • {rally.game_type_name}</p>
                
                <div className="space-y-1 text-xs text-slate-400">
                  <div>📅 Competition: {new Date(rally.competition_date).toLocaleDateString()}</div>
                  <div>⏰ Registration closes: {new Date(rally.registration_deadline).toLocaleDateString()}</div>
                  <div>👥 {rally.registered_participants || 0} / {rally.max_participants || '∞'} registered</div>
                </div>
                
                <div className="mt-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs font-medium">
                    Registration Open
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}