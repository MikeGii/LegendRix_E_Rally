// src/components/registration/RegistrationFormWithClasses.tsx - Updated with Unified Theme
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
  const [rulesAccepted, setRulesAccepted] = useState(false)

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
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-2xl">⚠️</span>
        </div>
        <p className="text-slate-400">Te peate olema sisse logitud, et rallidele registreeruda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isAlreadyRegistered && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-lg">✓</span>
            </div>
            <div>
              <p className="text-green-400 font-medium">Te olete registreeritud!</p>
              <p className="text-green-300 text-sm">
                Praegune klass: <span className="font-medium">{existingRegistration?.class_name}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Class Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-purple-400 text-lg">🎯</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isAlreadyRegistered ? 'Muuda klassi' : 'Vali klass'}
            </h3>
            <p className="text-slate-400 text-sm">
              {isAlreadyRegistered ? 'Vali uus klass või tühista registreering' : 'Vali klass, millega soovid osaleda'}
            </p>
          </div>
        </div>
        
        {isLoadingClasses ? (
          <div className="bg-slate-900/50 rounded-xl p-6">
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Laadin saadaolevaid klasse...</p>
            </div>
          </div>
        ) : availableClasses.length === 0 ? (
          <div className="bg-slate-900/50 rounded-xl p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-400 text-2xl">⚠️</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Klasse pole saadaval</h4>
              <p className="text-slate-400">Selle ralli jaoks pole hetkel ühtegi klassi konfigureeritud.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {availableClasses.map((gameClass) => (
              <label
                key={gameClass.id}
                className={`
                  block p-4 rounded-xl border cursor-pointer transition-all duration-200
                  ${selectedClassId === gameClass.id 
                    ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/25' 
                    : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
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
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${selectedClassId === gameClass.id 
                        ? 'bg-blue-500/30' 
                        : 'bg-purple-500/20'
                      }
                    `}>
                      <span className={`text-lg ${selectedClassId === gameClass.id ? 'text-blue-300' : 'text-purple-400'}`}>
                        🎯
                      </span>
                    </div>
                    <div>
                      <h4 className={`font-medium ${selectedClassId === gameClass.id ? 'text-blue-300' : 'text-white'}`}>
                        {gameClass.name}
                      </h4>

                    </div>
                  </div>
                  {selectedClassId === gameClass.id && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Registration Rules - Only shown for new registrations */}
      {!isAlreadyRegistered && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-lg">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Registreerimise tingimused</h3>
              <p className="text-slate-400 text-sm">Palun loe läbi ja nõustu tingimustega</p>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
            <div className="space-y-4 text-sm text-slate-300">
              <p className="font-medium text-white">Registreerudes käesolevale üritusele kinnitan, et:</p>
              
              <ol className="space-y-3 list-decimal list-inside">
                <li>olen broneerinud omale koha üritusel osalemiseks ja seeläbi on rangelt soovituslik ka osalemine. Enneaegselt registreerimise tühistamata jätmise või ürituse korraldajate mitte teavitamine ürituselt puudumise korral võidakse minu konto sulgeda või ajutiselt peatada. </li>
                
                <li>üritusel osaledes olen viisakas ja pean kinni mängu reeglitest ning üritusega seonduvatest tingimustest (näiteks pean olema Discordi WRC vestluskanalis võistluse ajal).</li>
                
                <li>minu mänguprofiili nime võidakse kasutada avalikult käesoleva veebirakenduse pealehel punktitabelites.</li>
                
                <li>minu mänguprofiili nime võidakse kajastada avalikult käesoleva veebirakenduse uudistevoos.</li>
                
                <li>minu üritusel osalemist mängus võidakse salvestada läbi sotsiaalmeedia platvormide ürituse kestel.</li>
              </ol>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
                <p className="text-red-300 text-sm font-medium">
                  ⚠️ Esimese kahe punkti rikkumise korral võidakse minu konto sulgeda või ajutiselt peatada.
                </p>
              </div>
            </div>
            
            {/* Acceptance checkbox */}
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="text-sm">
                  <span className="text-white font-medium">
                    Nõustun kõigi ülaltoodud tingimustega
                  </span>
                  <p className="text-slate-400 mt-1">
                    Märkides selle kasti kinnitad, et oled tingimused läbi lugenud ja nõustud nendega.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {isAlreadyRegistered ? (
          // User is already registered - show management options
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleChangeClass}
              disabled={isSubmitting || !selectedClassId || selectedClassId === existingRegistration?.class_id}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600/50 disabled:text-slate-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Muudan klassi...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🔄</span>
                  <span>Muuda klassi</span>
                </div>
              )}
            </button>
            
            <button
              onClick={handleUnregister}
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600/50 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Tühistan registreeringu...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>❌</span>
                  <span>Tühista registreering</span>
                </div>
              )}
            </button>
          </div>
        ) : (
          // User is not registered - show register button
          <button
            onClick={handleRegister}
            disabled={isSubmitting || !selectedClassId || !rulesAccepted}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600/50 disabled:text-slate-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Registreerun...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>📝</span>
                <span>Registreeru nüüd</span>
              </div>
            )}
          </button>
        )}
        
        {/* Cancel Button */}
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-slate-600/50 hover:bg-slate-700/50 disabled:bg-slate-700/30 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>←</span>
            <span>Tagasi</span>
          </div>
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700/30">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5">
            <span className="text-blue-400 text-sm">💡</span>
          </div>
          <div className="text-sm text-slate-400">
            {isAlreadyRegistered ? (
              <p>
                Te olete juba sellele rallile registreeritud. Saate oma klassi muuta või registreeringu tühistada.
                <span className="block mt-1 text-slate-500">
                  Klassi muutmine on võimalik kuni registreerimise tähtajani.
                </span>
              </p>
            ) : (
              <p>
                Valige klass, nõustuge tingimustega ja klikkige "Registreeru nüüd", et rallile registreeruda.
                <span className="block mt-1 text-slate-500">
                  Pärast registreerumist saate oma klassi muuta või registreeringu tühistada.
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}