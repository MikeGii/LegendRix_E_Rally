// src/components/registration/RallyRegistration.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { RegistrationForm } from './RegistrationForm'
import { RallyDetails } from './RallyDetails'
import { TransformedRally } from '@/hooks/useOptimizedRallies'

export function RallyRegistration() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [selectedRally, setSelectedRally] = useState<TransformedRally | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check if coming from a specific rally (prefill scenario)
  const preselectedRallyId = searchParams.get('rallyId')

  useEffect(() => {
    if (preselectedRallyId) {
      // Load the specific rally data
      loadRallyData(preselectedRallyId)
    }
  }, [preselectedRallyId])

  const loadRallyData = async (rallyId: string) => {
    setIsLoading(true)
    try {
      // This would normally fetch from your API
      // For now, we'll use a placeholder
      console.log('Loading rally data for:', rallyId)
      // TODO: Implement actual rally data fetching
    } catch (error) {
      console.error('Failed to load rally data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRallySelect = (rally: TransformedRally) => {
    setSelectedRally(rally)
  }

  const handleRegistrationComplete = () => {
    // Handle successful registration
    console.log('Registration completed!')
    // Redirect back to dashboard or show success message
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">📝</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Rally Registration</h1>
              <p className="text-slate-400">
                {preselectedRallyId 
                  ? 'Complete your rally registration below' 
                  : 'Select a game and rally to register for competition'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <RegistrationForm
              preselectedRallyId={preselectedRallyId}
              onRallySelect={handleRallySelect}
              onRegistrationComplete={handleRegistrationComplete}
            />
          </div>

          {/* Rally Details Sidebar */}
          <div className="lg:col-span-1">
            <RallyDetails 
              rally={selectedRally}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}