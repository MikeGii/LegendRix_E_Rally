// src/components/user/UserRegistrationsSection.tsx - Complete Enhanced Version with Past Rallies
'use client'

import { useState } from 'react'
import { UserRallyRegistration } from '@/hooks/useOptimizedRallies'

interface UserRegistrationsSectionProps {
  registrations: UserRallyRegistration[]
  isLoading: boolean
}

export function UserRegistrationsSection({ registrations, isLoading }: UserRegistrationsSectionProps) {
  const [showPastRallies, setShowPastRallies] = useState(false)

  if (registrations.length === 0) return null

  // Separate current/upcoming and past rallies
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  
  const currentRegistrations = registrations.filter(registration => {
    if (!registration.rally_competition_date) return true
    const competitionDate = new Date(registration.rally_competition_date)
    return competitionDate >= oneDayAgo
  })

  const pastRegistrations = registrations.filter(registration => {
    if (!registration.rally_competition_date) return false
    const competitionDate = new Date(registration.rally_competition_date)
    return competitionDate < oneDayAgo
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'disqualified': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered': return 'Registreeritud'
      case 'confirmed': return 'Kinnitatud'
      case 'cancelled': return 'Tühistatud'
      case 'completed': return 'Lõpetatud'
      case 'disqualified': return 'Diskvalifitseeritud'
      default: return status.toUpperCase()
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'refunded': return 'text-red-400'
      case 'waived': return 'text-blue-400'
      default: return 'text-slate-400'
    }
  }

  const getPaymentText = (status: string) => {
    switch (status) {
      case 'paid': return 'Makstud'
      case 'pending': return 'Ootel'
      case 'refunded': return 'Tagastatud'
      case 'waived': return 'Loobatud'
      default: return status
    }
  }

  const formatEstonianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatEstonianDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Registration Card Component
  const RegistrationCard = ({ registration, isPast = false }: { registration: UserRallyRegistration, isPast?: boolean }) => (
    <div className={`bg-slate-900/50 rounded-xl border border-slate-700/30 p-6 hover:border-slate-600/50 transition-all duration-200 ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white text-lg">{registration.rally_name}</h3>
          <p className="text-slate-400 text-sm">Klass: {registration.class_name}</p>
          {registration.rally_competition_date && (
            <p className="text-slate-500 text-xs mt-1">
              Ralli: {formatEstonianDateTime(registration.rally_competition_date)}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(registration.status)}`}>
            {getStatusText(registration.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Registreeritud:</span>
          <p className="text-slate-300">
            {formatEstonianDate(registration.registration_date)}
          </p>
        </div>
      </div>

      {registration.notes && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-slate-300 text-sm">{registration.notes}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <span>📋</span>
          <span>Minu ralli registreerimised ({registrations.length})</span>
        </h2>
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-3 py-1">
            <span className="text-blue-300 text-sm font-medium">
              {currentRegistrations.length} Aktiivsed
            </span>
          </div>
          {pastRegistrations.length > 0 && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-3 py-1">
              <span className="text-purple-300 text-sm font-medium">
                {pastRegistrations.length} toimunud
              </span>
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin registreerimisi...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Current/Upcoming Registrations */}
          {currentRegistrations.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white">Aktiivsed registreeringud</h3>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </div>
              {currentRegistrations.map((registration) => (
                <RegistrationCard key={registration.id} registration={registration} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-slate-500">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aktiivseid registreeringuid ei ole</h3>
              <p className="text-slate-400">Registreerige uueks ralliks, et alustada!</p>
            </div>
          )}

          {/* Past Rallies Section */}
          {pastRegistrations.length > 0 && (
            <div className="border-t border-slate-700/50 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-slate-300">Ralli ajalugu</h3>
                  <span className="text-slate-500 text-sm">({pastRegistrations.length})</span>
                </div>
                <button
                  onClick={() => setShowPastRallies(!showPastRallies)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-slate-500/50"
                >
                  <span>{showPastRallies ? '📁' : '📂'}</span>
                  <span>{showPastRallies ? 'Peida toimunud rallid' : 'Näita toimunud rallisid'}</span>
                  <span className={`transition-transform duration-200 ${showPastRallies ? 'rotate-180' : ''}`}>
                    ↓
                  </span>
                </button>
              </div>

              {/* Collapsible Past Rallies */}
              {showPastRallies && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-900/20 rounded-xl p-4 border border-slate-700/20">
                    <p className="text-slate-400 text-sm mb-4 flex items-center space-x-2">
                      <span>ℹ️</span>
                      <span>Siin kuvatakse rallid, mis on toimunud rohkem kui 24 tundi tagasi</span>
                    </p>
                    <div className="space-y-4">
                      {pastRegistrations.map((registration) => (
                        <RegistrationCard 
                          key={registration.id} 
                          registration={registration} 
                          isPast={true}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}