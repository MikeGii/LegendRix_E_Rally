// src/components/RallyRegistration.tsx - Complete component code
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useAllRallies } from '@/hooks/useOptimizedRallies'
import { RegistrationFormWithClasses } from '@/components/registration/RegistrationFormWithClasses'
import { RallyDetails } from '@/components/registration/RallyDetails'
import { RallySelectionGrid } from '@/components/registration/components/RallySelectionGrid'
import { RegistrationClosedMessage } from '@/components/registration/components/RegistrationClosedMessage'
import { RallyRegistrationHeader } from '@/components/registration/components/RallyRegistrationHeader'
import { TransformedRally } from '@/hooks/useOptimizedRallies'
import { canRegisterToRally, getRallyStatus } from '@/hooks/useOptimizedRallies'
import '@/styles/futuristic-theme.css'

interface RallyRegistrationProps {
  preselectedRallyId?: string
}

export function RallyRegistration({ preselectedRallyId }: RallyRegistrationProps) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const rallyIdFromUrl = searchParams.get('rallyId')
  const targetRallyId = preselectedRallyId || rallyIdFromUrl

  // Get all rallies to find the selected one
  const { data: allRallies = [], isLoading: ralliesLoading } = useAllRallies(50)

  useEffect(() => {
    if (targetRallyId && allRallies.length > 0) {
      const rally = allRallies.find(r => r.id === targetRallyId)
      if (rally) {
        setSelectedRally(rally)
      } else {
        console.warn(`Rally with ID ${targetRallyId} not found`)
      }
    }
  }, [targetRallyId, allRallies])

  const handleRegistrationComplete = () => {
    console.log('Registration completed!')
    router.push('/user-dashboard')
  }

  const handleCancel = () => {
    router.push('/user-dashboard')
  }

  const handleRallySelect = (rally: TransformedRally) => {
    setSelectedRally(rally)
    // Update URL without navigation
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('rallyId', rally.id)
      window.history.pushState({}, '', url.toString())
    }
  }

  const handleBackToSelection = () => {
    setSelectedRally(null)
    router.replace('/registration')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-black">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-5 pointer-events-none"></div>
      <div className="fixed top-40 right-40 w-48 h-48 sm:w-96 sm:h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>
      <div className="fixed bottom-40 left-40 w-48 h-48 sm:w-96 sm:h-96 bg-gray-600/10 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 pt-6 sm:pt-10">
        {/* Unified Header */}
        <RallyRegistrationHeader selectedRally={selectedRally} />

        {/* Main Content */}
        {selectedRally ? (
          canRegisterToRally(selectedRally) ? (
            // Show rally details and registration form
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Rally Details - Shows FIRST on mobile, LEFT on desktop (3 of 5 columns) */}
              <div className="col-span-1 lg:col-span-3">
                <RallyDetails rally={selectedRally} />
              </div>

              {/* Registration Form - Shows SECOND on mobile, RIGHT on desktop (2 of 5 columns) */}
              <div className="col-span-1 lg:col-span-2">
                <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-4 sm:p-6">
                  {/* Form Header */}
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(255,0,64,0.3)]">
                      <span className="text-red-400 text-lg sm:text-xl">📝</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
                        Registreerimine
                      </h2>
                      <p className="text-gray-500 text-xs sm:text-sm">Vali klass ja registreeru</p>
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
            // Show registration closed message
            <RegistrationClosedMessage 
              rally={selectedRally} 
              onBack={handleBackToSelection}
            />
          )
        ) : (
          // Show rally selection grid
          <RallySelectionGrid 
            rallies={allRallies}
            onRallySelect={handleRallySelect}
            isLoading={ralliesLoading}
          />
        )}
      </div>

      {/* Futuristic Corner Accents */}
      <div className="fixed top-5 sm:top-10 left-5 sm:left-10 w-10 sm:w-20 h-10 sm:h-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-red-500 to-transparent"></div>
      </div>
      <div className="fixed top-5 sm:top-10 right-5 sm:right-10 w-10 sm:w-20 h-10 sm:h-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-red-500 to-transparent"></div>
        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-red-500 to-transparent"></div>
      </div>
      <div className="fixed bottom-5 sm:bottom-10 left-5 sm:left-10 w-10 sm:w-20 h-10 sm:h-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-red-500 to-transparent"></div>
        <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-red-500 to-transparent"></div>
      </div>
      <div className="fixed bottom-5 sm:bottom-10 right-5 sm:right-10 w-10 sm:w-20 h-10 sm:h-20 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-red-500 to-transparent"></div>
        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-red-500 to-transparent"></div>
      </div>
    </div>
  )
}