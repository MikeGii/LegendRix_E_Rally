// src/components/RallyManagement.tsx - Updated with Unified Admin Design
'use client'

import { useState } from 'react'
import { useRallies, useDeleteRally } from '@/hooks/useRallyManagement'
import { useRallyNotification } from '@/hooks/useRallyNotification'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { CreateRallyModal } from '@/components/rally-management/CreateRallyModal'
import { useAdminAllRallies } from '@/hooks/useOptimizedRallies'

interface Rally {
  id: string
  name: string
  description?: string
  game_id: string
  game_type_id: string
  game_name?: string
  game_type_name?: string
  competition_date: string
  registration_deadline: string
  max_participants?: number
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'active' | 'completed' | 'cancelled'
  is_featured: boolean
  is_active: boolean
  registered_participants?: number
  total_events?: number
  total_tracks?: number
  created_at: string
  updated_at: string
}

export function RallyManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRally, setEditingRally] = useState<Rally | null>(null)
  const [selectedRally, setSelectedRally] = useState<string | null>(null)

  // Data hooks
  const { data: rallies = [], isLoading, error, refetch } = useAdminAllRallies(100)
  const deleteRallyMutation = useDeleteRally()
  const rallyNotificationMutation = useRallyNotification()

  const handleCreateRally = () => {
    setEditingRally(null)
    setShowCreateModal(true)
  }

  const handleEditRally = (rally: Rally) => {
    setEditingRally(rally)
    setShowCreateModal(true)
  }

  const handleDeleteRally = async (rallyId: string) => {
    if (window.confirm('Kas olete kindel, et soovite selle ralli kustutada?')) {
      try {
        await deleteRallyMutation.mutateAsync(rallyId)
      } catch (error) {
        console.error('Error deleting rally:', error)
        alert('Ralli kustutamine ebaõnnestus. Palun proovi uuesti.')
      }
    }
  }

    // NEW: Handle rally notification
  const handleSendNotification = async (rally: Rally) => {
    // For testing, we can use the admin email
    const useTestEmail = false // Set to false for production
    const testEmail = useTestEmail ? 'ewrc.admin@ideemoto.ee' : undefined
    
    const confirmMessage = useTestEmail 
      ? `Kas soovite saata teavituse testimiseks e-posti aadressile ewrc.admin@ideemoto.ee?\n\nRalli: ${rally.name}`
      : `Kas olete kindel, et soovite saata e-maili teavituse kõikidele registreeritud kasutajatele?\n\nRalli: ${rally.name}`
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await rallyNotificationMutation.mutateAsync({
          rallyId: rally.id,
          testEmail
        })
        
        const successMessage = useTestEmail
          ? `✅ Test e-mail saadetud!\n\nSaadeti: ${result.emailsSent} e-maili\nEbaõnnestus: ${result.emailsFailed} e-maili`
          : `✅ Teavitus saadetud!\n\nSaadeti: ${result.emailsSent} e-maili\nEbaõnnestus: ${result.emailsFailed} e-maili\nKokku kasutajaid: ${result.totalEmails}`
        
        alert(successMessage)
      } catch (error) {
        console.error('Error sending notification:', error)
        alert('E-maili saatmine ebaõnnestus. Palun proovi uuesti.')
      }
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingRally(null)
  }

  const handleRefresh = () => {
    refetch()
  }

  // Calculate stats
  const activeRallies = rallies.filter(rally => rally.is_active).length
  const featuredRallies = rallies.filter(rally => rally.is_featured).length
  const upcomingRallies = rallies.filter(rally => 
    new Date(rally.competition_date) > new Date()
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Unified Admin Header */}
        <AdminPageHeader
          title="Rallide haldamine"
          description="Loo ja halda rallisid ning võistlusi"
          icon="🏁"
          stats={[
            { label: 'Aktiivsed rallid', value: activeRallies, color: 'green' },
            { label: 'Esile tõstetud', value: featuredRallies, color: 'yellow' },
            { label: 'Eelseisvad', value: upcomingRallies, color: 'blue' },
            { label: 'Kokku rallieid', value: rallies.length, color: 'blue' }
          ]}
          actions={[
            {
              label: 'Loo uus ralli',
              onClick: handleCreateRally,
              variant: 'success',
              icon: '➕'
            }
          ]}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Rallies Grid */}
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-xl">🏁</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Kõik rallid</h2>
                <p className="text-slate-400">Halda olemasolevaid rallieid</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Laadin rallieid...</p>
            </div>
          ) : rallies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-slate-500">🏁</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ühtegi ralli pole loodud</h3>
              <p className="text-slate-400 mb-4">Loo esimene ralli, et alustada</p>
              <button
                onClick={handleCreateRally}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Loo esimene ralli
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rallies.map((rally) => (
                <div
                  key={rally.id}
                  className={`
                    bg-slate-900/50 rounded-xl border p-6 transition-all duration-200 cursor-pointer
                    ${selectedRally === rally.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-slate-700/50 hover:border-slate-600'
                    }
                  `}
                  onClick={() => setSelectedRally(selectedRally === rally.id ? null : rally.id)}
                >
                  {/* Rally Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-lg">🏁</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{rally.name}</h3>
                        <p className="text-sm text-slate-400">{rally.game_name}</p>
                      </div>
                    </div>

                    {rally.is_featured && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                        ⭐ ESILETÕSTETUD
                      </span>
                    )}
                  </div>

                  {/* Rally Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">🎮</span>
                      <span className="text-slate-300">{rally.game_type_name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">📅</span>
                      <span className="text-slate-300">
                        {new Date(rally.competition_date).toLocaleDateString('et-EE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">⏰</span>
                      <span className="text-slate-300">
                        Registreerimine kuni {new Date(rally.registration_deadline).toLocaleDateString('et-EE')}
                      </span>
                    </div>

                    {rally.max_participants && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-400">👥</span>
                        <span className="text-slate-300">
                          Max {rally.max_participants} osalejat
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rally Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      rally.is_active 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {rally.is_active ? 'AKTIIVNE' : 'MITTEAKTIIVNE'}
                    </span>
                    
                    <span className="text-xs text-slate-500">
                      {rally.status.toUpperCase()}
                    </span>
                  </div>
                  {/* Rally Actions - UPDATED WITH NOTIFICATION BUTTON */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditRally(rally)
                      }}
                      className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Muuda
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRally(rally.id)
                      }}
                      disabled={deleteRallyMutation.isPending}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      Kustuta
                    </button>
                  </div>

                  {/* NEW: Notification Button */}
                  <div className="mb-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSendNotification(rally)
                      }}
                      disabled={rallyNotificationMutation.isPending}
                      className="w-full px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {rallyNotificationMutation.isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                          <span>Saadan...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>📧</span>
                          <span>Saada teavitus</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedRally === rally.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="space-y-2 text-sm">
                        {rally.description && (
                          <div>
                            <span className="text-slate-400">Kirjeldus:</span>
                            <p className="text-slate-300 mt-1">{rally.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <span className="text-slate-400">Sündmused:</span>
                            <span className="text-slate-300 ml-2">{rally.total_events || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Rajad:</span>
                            <span className="text-slate-300 ml-2">{rally.total_tracks || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Registreeritud:</span>
                            <span className="text-slate-300 ml-2">{rally.registered_participants || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Loodud:</span>
                            <span className="text-slate-300 ml-2">
                              {new Date(rally.created_at).toLocaleDateString('et-EE')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateRallyModal
            rally={editingRally}
            onClose={handleCloseModal}
            onSuccess={handleRefresh}
          />
        )}
      </div>
    </div>
  )
}