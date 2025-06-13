// src/components/registration/RegistrationFormWithClasses.tsx - CORRECTED with real properties + management
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { 
  useRallyAvailableClasses, 
  useCreateRegistration, 
  useUpdateRegistration, 
  useDeleteRegistration 
} from '@/hooks/useRallyRegistrations'

interface RegistrationFormWithClassesProps {
  rallyId: string
  rallyName: string
  onSuccess: () => void
  onCancel: () => void
}

export function RegistrationFormWithClasses({ 
  rallyId, 
  rallyName, 
  onSuccess, 
  onCancel 
}: RegistrationFormWithClassesProps) {
  const { user } = useAuth()
  const [selectedClassId, setSelectedClassId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get user's registrations to check if already registered
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  const { data: availableClasses = [], isLoading: isLoadingClasses } = useRallyAvailableClasses(rallyId)
  
  // Mutations
  const createRegistrationMutation = useCreateRegistration()
  const updateRegistrationMutation = useUpdateRegistration()
  const deleteRegistrationMutation = useDeleteRegistration()

  // Check if user is already registered for this rally
  const existingRegistration = userRegistrations.find(
    reg => reg.rally_id === rallyId && 
           (reg.status === 'registered' || reg.status === 'confirmed')
  )

  const isAlreadyRegistered = !!existingRegistration

  // Set initial class if user is already registered
  useEffect(() => {
    if (existingRegistration && availableClasses.length > 0) {
      setSelectedClassId(existingRegistration.class_id)
    }
  }, [existingRegistration, availableClasses])

  const handleRegister = async () => {
    if (!selectedClassId) {
      alert('Please select a class first')
      return
    }

    setIsSubmitting(true)
    try {
      await createRegistrationMutation.mutateAsync({
        rally_id: rallyId,
        class_id: selectedClassId
      })
      
      alert('Registration successful!')
      onSuccess()
    } catch (error: any) {
      console.error('Registration error:', error)
      alert('Registration failed: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeClass = async () => {
    if (!selectedClassId || !existingRegistration) {
      alert('Please select a class first')
      return
    }

    if (selectedClassId === existingRegistration.class_id) {
      alert('You are already registered in this class')
      return
    }

    setIsSubmitting(true)
    try {
      await updateRegistrationMutation.mutateAsync({
        registrationId: existingRegistration.id,
        class_id: selectedClassId
      })
      
      alert('Class changed successfully!')
      onSuccess()
    } catch (error: any) {
      console.error('Update error:', error)
      alert('Failed to change class: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnregister = async () => {
    if (!existingRegistration) return

    if (!confirm(`Are you sure you want to unregister from "${rallyName}"? This action cannot be undone.`)) {
      return
    }

    setIsSubmitting(true)
    try {
      await deleteRegistrationMutation.mutateAsync(existingRegistration.id)
      
      alert('Successfully unregistered from rally!')
      onSuccess()
    } catch (error: any) {
      console.error('Unregister error:', error)
      alert('Failed to unregister: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">You must be logged in to register for rallies.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isAlreadyRegistered ? 'Manage Registration' : 'Register for Rally'}
        </h2>
        <p className="text-slate-400">
          Rally: <span className="text-white font-medium">{rallyName}</span>
        </p>
        {isAlreadyRegistered && (
          <p className="text-blue-400 mt-2">
            ✓ You are currently registered in: <span className="font-medium">{existingRegistration?.class_name}</span>
          </p>
        )}
      </div>

      {/* Class Selection */}
      <div className="bg-slate-700/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {isAlreadyRegistered ? 'Change Class' : 'Select Class'}
        </h3>
        
        {isLoadingClasses ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading available classes...</p>
          </div>
        ) : availableClasses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No classes available for this rally.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableClasses.map((gameClass) => (
              <label
                key={gameClass.id}
                className={`
                  block p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${selectedClassId === gameClass.id 
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                    : 'bg-slate-600/30 border-slate-600 text-slate-300 hover:border-slate-500'
                  }
                `}
              >
                <input
                  type="radio"
                  name="class"
                  value={gameClass.id}
                  checked={selectedClassId === gameClass.id}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-purple-400 text-lg">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{gameClass.name}</h4>
                      <p className="text-sm opacity-75">Class ID: {gameClass.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  {selectedClassId === gameClass.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        {isAlreadyRegistered ? (
          // User is already registered - show management options
          <>
            <button
              onClick={handleChangeClass}
              disabled={isSubmitting || !selectedClassId || selectedClassId === existingRegistration?.class_id}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Changing Class...' : 'Change Class'}
            </button>
            
            <button
              onClick={handleUnregister}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Unregistering...' : 'Unregister'}
            </button>
          </>
        ) : (
          // User is not registered - show register button
          <button
            onClick={handleRegister}
            disabled={isSubmitting || !selectedClassId}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registering...' : 'Register Now'}
          </button>
        )}
        
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-slate-400">
        {isAlreadyRegistered ? (
          <p>You can change your class or unregister from this rally above.</p>
        ) : (
          <p>Select a class and click register to join this rally.</p>
        )}
      </div>
    </div>
  )
}