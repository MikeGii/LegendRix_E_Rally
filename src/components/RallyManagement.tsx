// src/components/RallyManagement.tsx - Updated with Active/Completed Rally Tabs
'use client'

import { useState } from 'react'
import { useRallies, useDeleteRally } from '@/hooks/useRallyManagement'
import { useRallyNotification } from '@/hooks/useRallyNotification'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { CreateRallyModal } from '@/components/rally-management/CreateRallyModal'
import { useAdminAllRallies, useServerSideStatusUpdate } from '@/hooks/useOptimizedRallies'
import { RefreshCw, AlertCircle } from 'lucide-react'

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

type TabType = 'active' | 'completed'

export function RallyManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingRally, setEditingRally] = useState<Rally | null>(null)
  const [selectedRally, setSelectedRally] = useState<string | null>(null)

  // Data hooks
  const { data: allRallies = [], isLoading, error, refetch } = useAdminAllRallies(100)
  const deleteRallyMutation = useDeleteRally()
  const rallyNotificationMutation = useRallyNotification()
  const updateStatuses = useServerSideStatusUpdate() 

  const hasStatusMismatch = allRallies.some(rally => rally.needs_status_update)

  // FILTER: Separate active and completed rallies
  const activeRallies = allRallies.filter(rally => 
    rally.status !== 'completed' && rally.is_active
  )
  
  const completedRallies = allRallies.filter(rally => 
    rally.status === 'completed' || !rally.is_active
  )

  const currentRallies = activeTab === 'active' ? activeRallies : completedRallies

  const handleStatusUpdate = async () => {
    try {
      const result = await updateStatuses.mutateAsync()
      if (result.updated > 0) {
        // Refetch rallies to show updated statuses
        refetch()
      }
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

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

  const handleSendNotification = async (rally: Rally) => {
    const useTestEmail = false
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
        
        alert(`E-maili teavitus edukalt saadetud${testEmail ? ' (test)' : ''}!`)
      } catch (error: any) {
        console.error('Notification error:', error)
        alert(`E-maili saatmine ebaõnnestus: ${error.message || 'Tundmatu viga'}`)
      }
    }
  }

    const handleSendReminder = async (rally: Rally) => {
    const useTestEmail = false
    const testEmail = useTestEmail ? 'ewrc.admin@ideemoto.ee' : undefined
    
    const confirmMessage = useTestEmail 
      ? `Kas olete kindel, et soovite saata korduvteavituse TESTI meilile ${testEmail}?`
      : 'Kas olete kindel, et soovite saata korduvteavituse KÕIGILE kasutajatele?'
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('📧 Sending reminder for rally:', rally.id)
        await rallyNotificationMutation.mutateAsync({ 
          rallyId: rally.id,
          testEmail: testEmail,
          isReminder: true
        })
        alert('Korduvteavitus saadetud!')
      } catch (error) {
        console.error('Error sending reminder:', error)
        alert('Korduvteavituse saatmine ebaõnnestus. Palun proovi uuesti.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'registration_open': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'registration_closed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'active': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Tulemas'
      case 'registration_open': return 'Registreerimine avatud'
      case 'registration_closed': return 'Registreerimine suletud'
      case 'active': return 'Käimasolev'
      case 'completed': return 'Lõppenud'
      case 'cancelled': return 'Tühistatud'
      default: return status
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Rally juhtimine"
        description="Halda rallieid, üritusi ja osalejaid"
        icon="🏁"
      />

    {/* Tab Navigation */}
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        {/* Tab Buttons */}
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'active'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏁 Aktiivsed rallid ({activeRallies.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'completed'
                  ? 'bg-slate-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏆 Lõppenud rallid ({completedRallies.length})
            </button>
          </div>

          {/* Status Update Button */}
          <button
            onClick={() => updateStatuses.mutate()}
            disabled={updateStatuses.isPending}
            className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Uuenda kõikide rallide staatuseid andmebaasis"
          >
            <RefreshCw className={`h-4 w-4 ${updateStatuses.isPending ? 'animate-spin' : ''}`} />
            <span>Uuenda staatused</span>
          </button>
        </div>

          {/* Create Rally Button - Only show on active tab */}
          {activeTab === 'active' && (
            <button
              onClick={handleCreateRally}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Loo uus ralli</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Laadin rallieid...</p>
          </div>
        ) : currentRallies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-slate-500">
                {activeTab === 'active' ? '🏁' : '🏆'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {activeTab === 'active' ? 'Aktiivseid rallieid pole' : 'Lõppenud rallieid pole'}
            </h3>
            <p className="text-slate-400 mb-4">
              {activeTab === 'active' 
                ? 'Loo esimene ralli, et alustada' 
                : 'Lõppenud rallid kuvatakse siin pärast nende lõppemist'
              }
            </p>
            {activeTab === 'active' && (
              <button
                onClick={handleCreateRally}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Loo esimene ralli
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentRallies.map((rally) => (
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
                </div>

                {/* Rally Status */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rally.status)}`}>
                    {getStatusText(rally.status)}
                  </span>
                  {!rally.is_active && (
                    <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
                      PEIDETUD
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
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-slate-400">⏰</span>
                    <span className="text-slate-300">
                      Registreerimine kuni {new Date(rally.registration_deadline).toLocaleDateString('et-EE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {typeof rally.registered_participants === 'number' && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">👥</span>
                      <span className="text-slate-300">
                        {rally.registered_participants} registreerunud
                        {rally.max_participants && ` / ${rally.max_participants}`}
                      </span>
                    </div>
                  )}

                  {rally.total_events && rally.total_events > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-slate-400">🌍</span>
                      <span className="text-slate-300">
                        {rally.total_events} {rally.total_events === 1 ? 'riik' : 'riiki'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rally Description */}
                {rally.description && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {rally.description}
                    </p>
                  </div>
                )}

                {/* Rally Actions - Show when selected */}
                {selectedRally === rally.id && (
                  <div className="space-y-3 pt-4 border-t border-slate-700/30">
                    {/* Edit and Delete buttons on same row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditRally(rally)
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        ✏️ Muuda
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRally(rally.id)
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        🗑️ Kustuta ralli
                      </button>
                    </div>
                    
                    {/* Notification buttons on same row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendNotification(rally)
                        }}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        📧 Teavita
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendReminder(rally)
                        }}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        🔔 Korduvteavitus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Rally Modal */}
      {showCreateModal && (
        <CreateRallyModal
          rally={editingRally}
          onClose={() => {
            setShowCreateModal(false)
            setEditingRally(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setEditingRally(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}