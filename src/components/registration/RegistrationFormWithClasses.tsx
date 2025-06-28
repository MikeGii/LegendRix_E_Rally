// src/components/registration/RegistrationFormWithClasses.tsx - FUTURISTIC MODULAR REDESIGN
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useUserRallyRegistrations } from '@/hooks/useOptimizedRallies'
import { useRallyClasses } from '@/hooks/useRallyManagement'
import { 
  useCreateRegistration, 
  useUpdateRegistration, 
  useDeleteRegistration 
} from '@/hooks/useRallyRegistrations'
import { RegistrationStatus } from './components/RegistrationStatus'
import { ClassSelector } from './components/ClassSelector'
import { RegistrationRules } from './components/RegistrationRules'
import { RegistrationActions } from './components/RegistrationActions'
import { HelpSection } from './components/HelpSection'
import '@/styles/futuristic-theme.css'

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
  const [rulesAccepted, setRulesAccepted] = useState(false)

  // Get user's registrations to check if already registered
  const { data: userRegistrations = [] } = useUserRallyRegistrations()
  const { data: rallyClasses = [], isLoading: isLoadingClasses } = useRallyClasses(rallyId)

  // Transform rally classes to expected format
  const availableClasses = rallyClasses.map(rallyClass => ({
    id: rallyClass.class_id,
    name: rallyClass.class_name || 'Unknown Class'
  }))
  
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
  // Only set once when component mounts or when registration status changes
  useEffect(() => {
    if (existingRegistration && availableClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(existingRegistration.class_id)
    }
  }, [existingRegistration?.id]) // Only depend on registration ID change

  const handleRegister = async () => {
    if (!selectedClassId) {
      alert('Palun vali esmalt klass')
      return
    }

    if (!rulesAccepted) {
      alert('Palun nõustu registreerimise tingimustega enne jätkamist')
      return
    }

    setIsSubmitting(true)
    try {
      await createRegistrationMutation.mutateAsync({
        rally_id: rallyId,
        class_id: selectedClassId
      })
      
      alert('Registreerimine õnnestus!')
      onSuccess()
    } catch (error: any) {
      console.error('Registration error:', error)
      alert('Registreerimine ebaõnnestus: ' + (error.message || 'Tundmatu viga'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangeClass = async () => {
    if (!selectedClassId || !existingRegistration) {
      alert('Palun vali esmalt klass')
      return
    }

    if (selectedClassId === existingRegistration.class_id) {
      alert('Te olete juba selles klassis registreeritud')
      return
    }

    setIsSubmitting(true)
    try {
      await updateRegistrationMutation.mutateAsync({
        registrationId: existingRegistration.id,
        class_id: selectedClassId
      })
      
      alert('Klass edukalt muudetud!')
      onSuccess()
    } catch (error: any) {
      console.error('Update error:', error)
      alert('Klassi muutmine ebaõnnestus: ' + (error.message || 'Tundmatu viga'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnregister = async () => {
    if (!existingRegistration) return

    if (!confirm(`Kas olete kindel, et soovite "${rallyName}" registreeringu tühistada? Seda tegevust ei saa tagasi võtta.`)) {
      return
    }

    setIsSubmitting(true)
    try {
      await deleteRegistrationMutation.mutateAsync(existingRegistration.id)
      
      alert('Registreering edukalt tühistatud!')
      onSuccess()
    } catch (error: any) {
      console.error('Unregister error:', error)
      alert('Registreeringu tühistamine ebaõnnestus: ' + (error.message || 'Tundmatu viga'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30 shadow-[0_0_20px_rgba(255,0,64,0.3)]">
          <span className="text-red-400 text-2xl">⚠️</span>
        </div>
        <p className="text-gray-400">Te peate olema sisse logitud, et rallidele registreeruda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isAlreadyRegistered && existingRegistration && (
        <RegistrationStatus 
          className={existingRegistration.class_name || 'Unknown'}
        />
      )}

      {/* Class Selection */}
      <ClassSelector
        isAlreadyRegistered={isAlreadyRegistered}
        selectedClassId={selectedClassId}
        onClassSelect={setSelectedClassId}
        availableClasses={availableClasses}
        isLoading={isLoadingClasses}
      />

      {/* Registration Rules - Only shown for new registrations */}
      {!isAlreadyRegistered && (
        <RegistrationRules 
          rulesAccepted={rulesAccepted}
          onRulesChange={setRulesAccepted}
        />
      )}

      {/* Action Buttons */}
      <RegistrationActions
        isAlreadyRegistered={isAlreadyRegistered}
        isSubmitting={isSubmitting}
        selectedClassId={selectedClassId}
        rulesAccepted={rulesAccepted}
        existingRegistrationClassId={existingRegistration?.class_id}
        onRegister={handleRegister}
        onChangeClass={handleChangeClass}
        onUnregister={handleUnregister}
        onCancel={onCancel}
      />

      {/* Help Section */}
      <HelpSection isAlreadyRegistered={isAlreadyRegistered} />
    </div>
  )
}