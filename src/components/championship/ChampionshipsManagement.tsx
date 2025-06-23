// src/components/championship/ChampionshipsManagement.tsx - COMPLETE VERSION with Rally Linking
'use client'

import { useState, useEffect } from 'react'
import { useChampionships, useCreateChampionship, useActivateChampionship, useCompleteChampionship, useReopenChampionship } from '@/hooks/useChampionshipManagement'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { CreateChampionshipModal } from './CreateChampionshipModal'
import { ChampionshipDetailsModal } from './ChampionshipDetailsModal'
import { supabase } from '@/lib/supabase'

// Rally Linking Modal Component (inline)
interface Rally {
  id: string
  name: string
  competition_date: string
  status: string
  game_name?: string
  total_participants?: number
}

interface ChampionshipRally {
  id: string
  championship_id: string
  rally_id: string
  round_number: number
  is_active: boolean
  rally_name?: string
  rally_date?: string
}

interface RallyLinkingModalProps {
  championshipId: string
  championshipName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function RallyLinkingModal({ 
  championshipId, 
  championshipName, 
  isOpen, 
  onClose, 
  onSuccess 
}: RallyLinkingModalProps) {
  const [availableRallies, setAvailableRallies] = useState<Rally[]>([])
  const [linkedRallies, setLinkedRallies] = useState<ChampionshipRally[]>([])
  const [selectedRallies, setSelectedRallies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (isOpen && championshipId) {
      loadData()
    }
  }, [isOpen, championshipId])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load all completed rallies
      const { data: rallies, error: ralliesError } = await supabase
        .from('rallies')
        .select(`
          id,
          name,
          competition_date,
          status,
          games(name)
        `)
        .eq('status', 'completed')
        .order('competition_date', { ascending: false })

      if (ralliesError) throw ralliesError

      // Load currently linked rallies
      const { data: linked, error: linkedError } = await supabase
        .from('championship_rallies')
        .select(`
          id,
          championship_id,
          rally_id,
          round_number,
          is_active,
          rallies!inner(name, competition_date)
        `)
        .eq('championship_id', championshipId)
        .order('round_number', { ascending: true })

      if (linkedError) throw linkedError

      // Get participant counts for rallies
      const rallyIds = rallies?.map(r => r.id) || []
      let participantCounts: Record<string, number> = {}
      
      if (rallyIds.length > 0) {
        const { data: participantData } = await supabase
          .from('rally_results')
          .select('rally_id')
          .in('rally_id', rallyIds)

        participantData?.forEach(p => {
          participantCounts[p.rally_id] = (participantCounts[p.rally_id] || 0) + 1
        })
      }

      // Format rallies
      const formattedRallies = (rallies || []).map(rally => ({
        id: rally.id,
        name: rally.name,
        competition_date: rally.competition_date,
        status: rally.status,
        game_name: (rally.games as any)?.name || 'Unknown Game',
        total_participants: participantCounts[rally.id] || 0
      }))

      // Format linked rallies
      const formattedLinked = (linked || []).map(l => ({
        id: l.id,
        championship_id: l.championship_id,
        rally_id: l.rally_id,
        round_number: l.round_number,
        is_active: l.is_active,
        rally_name: (l.rallies as any)?.name || 'Unknown Rally',
        rally_date: (l.rallies as any)?.competition_date || ''
      }))

      setAvailableRallies(formattedRallies)
      setLinkedRallies(formattedLinked)
    } catch (error) {
      console.error('Error loading rally data:', error)
      alert('Viga andmete laadimisel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRallies = async () => {
    if (selectedRallies.length === 0) return

    setIsLoading(true)
    try {
      // Get the next round numbers
      const maxRound = Math.max(...linkedRallies.map(r => r.round_number), 0)
      
      // Create championship_rallies entries
      const newEntries = selectedRallies.map((rallyId, index) => ({
        championship_id: championshipId,
        rally_id: rallyId,
        round_number: maxRound + index + 1,
        is_active: true,
        created_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('championship_rallies')
        .insert(newEntries)

      if (error) throw error

      alert(`${selectedRallies.length} rallit lisatud meistrivõistlusele!`)
      setSelectedRallies([])
      await loadData()
      onSuccess()
    } catch (error) {
      console.error('Error adding rallies:', error)
      alert('Viga rallide lisamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveRally = async (championshipRallyId: string, rallyName: string) => {
    const confirmed = confirm(`Kas oled kindel, et soovid eemaldada ralli "${rallyName}" meistrivõistlusest?`)
    
    if (confirmed) {
      setIsLoading(true)
      try {
        const { error } = await supabase
          .from('championship_rallies')
          .delete()
          .eq('id', championshipRallyId)

        if (error) throw error

        alert('Rally eemaldatud!')
        await loadData()
        onSuccess()
      } catch (error) {
        console.error('Error removing rally:', error)
        alert('Viga ralli eemaldamisel')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleToggleRallySelection = (rallyId: string) => {
    setSelectedRallies(prev => 
      prev.includes(rallyId) 
        ? prev.filter(id => id !== rallyId)
        : [...prev, rallyId]
    )
  }

  // Filter available rallies (exclude already linked ones)
  const linkedRallyIds = linkedRallies.map(r => r.rally_id)
  const filteredAvailableRallies = availableRallies
    .filter(rally => !linkedRallyIds.includes(rally.id))
    .filter(rally => 
      filter === '' || 
      rally.name.toLowerCase().includes(filter.toLowerCase()) ||
      rally.game_name?.toLowerCase().includes(filter.toLowerCase())
    )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Rallide haldus</h2>
              <p className="text-slate-400">Meistrivõistlus: {championshipName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Current Championship Rallies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Meistrivõistluse rallid ({linkedRallies.length})
              </h3>
              
              {linkedRallies.length === 0 ? (
                <div className="text-center py-8 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-400">Ühtegi rallit pole veel lisatud</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {linkedRallies.map((rally) => (
                    <div key={rally.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {rally.round_number}. {rally.rally_name}
                          </div>
                          <div className="text-sm text-slate-400">
                            {new Date(rally.rally_date).toLocaleDateString('et-EE')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveRally(rally.id, rally.rally_name)}
                          className="text-red-400 hover:text-red-300 ml-2"
                          disabled={isLoading}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Rallies */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Saadaolevad rallid
                </h3>
                <input
                  type="text"
                  placeholder="Otsi rallisid..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredAvailableRallies.map((rally) => (
                  <div 
                    key={rally.id} 
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedRallies.includes(rally.id)
                        ? 'bg-blue-600/30 border border-blue-500'
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                    onClick={() => handleToggleRallySelection(rally.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRallies.includes(rally.id)}
                        onChange={() => handleToggleRallySelection(rally.id)}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{rally.name}</div>
                        <div className="text-sm text-slate-400">
                          {new Date(rally.competition_date).toLocaleDateString('et-EE')} • 
                          {rally.game_name} • 
                          {rally.total_participants} osalejat
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAvailableRallies.length === 0 && (
                  <div className="text-center py-8 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-400">
                      {filter ? 'Otsingu järgi pole rallisid' : 'Kõik rallid on juba lisatud'}
                    </p>
                  </div>
                )}
              </div>

              {selectedRallies.length > 0 && (
                <button
                  onClick={handleAddRallies}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                >
                  {isLoading ? 'Lisan...' : `Lisa ${selectedRallies.length} rallit`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Championships Management Component
export function ChampionshipsManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedChampionship, setSelectedChampionship] = useState<string | null>(null)
  const [statusActionChampionship, setStatusActionChampionship] = useState<string | null>(null)
  const [rallyModalChampionship, setRallyModalChampionship] = useState<{ id: string, name: string } | null>(null)

  const { data: championships = [], isLoading, refetch } = useChampionships()
  const activateChampionshipMutation = useActivateChampionship()
  const completeChampionshipMutation = useCompleteChampionship()
  const reopenChampionshipMutation = useReopenChampionship()

  const handleCreateChampionship = () => {
    setShowCreateModal(true)
  }

  const handleActivateChampionship = async (championshipId: string, championshipName: string) => {
    const confirmed = confirm(
      `Kas oled kindel, et soovid kinnitada meistrivõistluse "${championshipName}" tulemused?\n\n` +
      `Pärast kinnitamist:\n` +
      `• Meistrivõistlus muutub avalikuks\n` +
      `• Tulemused ilmuvad Edetabelis\n` +
      `• Tulemusi ei saa enam muuta`
    )

    if (confirmed) {
      try {
        await activateChampionshipMutation.mutateAsync(championshipId)
        alert('Meistrivõistluse tulemused on edukalt kinnitatud!')
        refetch()
      } catch (error) {
        console.error('Error activating championship:', error)
        alert('Viga kinnitamisel. Palun proovi uuesti.')
      }
    }
  }

  const handleCompleteChampionship = async (championshipId: string, championshipName: string) => {
    const confirmed = confirm(
      `Kas oled kindel, et soovid märkida meistrivõistluse "${championshipName}" lõpetatuks?\n\n` +
      `Pärast lõpetamist:\n` +
      `• Meistrivõistlus count'ib kasutajate saavutuste ja statistika jaoks\n` +
      `• Võitjad saavad "Meister" saavutuse\n` +
      `• Saad meistrivõistluse hiljem uuesti avada vajaduse korral`
    )

    if (confirmed) {
      setStatusActionChampionship(championshipId)
      try {
        const result = await completeChampionshipMutation.mutateAsync(championshipId)
        if (result.success) {
          alert('Meistrivõistlus märgitud lõpetatuks!')
          refetch()
        } else {
          alert(result.error || 'Viga meistrivõistluse lõpetamisel')
        }
      } catch (error) {
        console.error('Error completing championship:', error)
        alert('Viga meistrivõistluse lõpetamisel')
      } finally {
        setStatusActionChampionship(null)
      }
    }
  }

  const handleReopenChampionship = async (championshipId: string, championshipName: string) => {
    const confirmed = confirm(
      `Kas oled kindel, et soovid avada meistrivõistluse "${championshipName}" uuesti?\n\n` +
      `Pärast avamist:\n` +
      `• Meistrivõistlus enam ei count'i kasutajate statistika jaoks\n` +
      `• Saavutused võivad muutuda\n` +
      `• Saad hiljem uuesti lõpetatuks märkida`
    )

    if (confirmed) {
      setStatusActionChampionship(championshipId)
      try {
        const result = await reopenChampionshipMutation.mutateAsync(championshipId)
        if (result.success) {
          alert('Meistrivõistlus avatud uuesti!')
          refetch()
        } else {
          alert(result.error || 'Viga meistrivõistluse avamisel')
        }
      } catch (error) {
        console.error('Error reopening championship:', error)
        alert('Viga meistrivõistluse avamisel')
      } finally {
        setStatusActionChampionship(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCompletionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* Unified Admin Header */}
      <AdminPageHeader
        title="Meistrivõistlused"
        description="Halda meistrivõistlusi ja nende tulemusi"
        icon="🏆"
        stats={[
          { label: 'Kokku meistrivõistlusi', value: championships.length, color: 'blue' },
          { label: 'Aktiivseid', value: championships.filter(c => c.is_active).length, color: 'green' },
          { label: 'Lõpetatud', value: championships.filter(c => c.status === 'completed').length, color: 'red' },
          { label: 'Ootab kinnitust', value: championships.filter(c => !c.is_active).length, color: 'yellow' }
        ]}
        actions={[
          {
            label: 'Osalejate sidumine',
            onClick: () => window.location.href = '/participant-linking',
            variant: 'secondary',
            icon: '🔗'
          },
          {
            label: 'Loo meistrivõistlus',
            onClick: handleCreateChampionship,
            variant: 'primary',
            icon: '➕'
          }
        ]}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Championships Table */}
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Meistrivõistluste nimekiri</h2>
            <div className="text-sm text-slate-400">
              Käimasolevad: {championships.filter(c => c.status === 'ongoing').length} • 
              Lõpetatud: {championships.filter(c => c.status === 'completed').length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-700/30 rounded h-16"></div>
                ))}
              </div>
            </div>
          ) : championships.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Pole veel meistrivõistlusi</h3>
              <p className="text-slate-400 mb-6">Alusta esimese meistrivõistluse loomisega</p>
              <button
                onClick={handleCreateChampionship}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                ➕ Loo meistrivõistlus
              </button>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Meistrivõistlus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Hooaeg
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Mäng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Rallide arv
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Aktiivsus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Staatus
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Loodud
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Tegevused
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {championships.map((championship) => (
                  <tr key={championship.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex-1">
                        <div className="font-medium text-white">{championship.name}</div>
                        {championship.description && (
                          <div className="mt-1">
                            <div className="text-sm text-slate-400 line-clamp-2">
                              {championship.description}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{championship.season_year}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-white">{championship.game_name || 'Kõik mängud'}</div>
                        {championship.game_type_name && (
                          <div className="text-slate-400">{championship.game_type_name}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">{championship.total_rallies || 0}</span>
                        {(championship.total_rallies || 0) > 0 && (
                          <span className="text-slate-500">rallid</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {championship.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                          ✅ Aktiivne
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          ⏳ Ootab kinnitust
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {/* Status Badge */}
                        <div className={`
                          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border w-fit
                          ${championship.status === 'completed'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }
                        `}>
                          {championship.status === 'completed' ? '🏁 Lõpetatud' : '🏃 Käimasolev'}
                        </div>
                        
                        {/* Completion Date */}
                        {championship.status === 'completed' && championship.completed_at && (
                          <div className="text-xs text-slate-500">
                            {formatCompletionDate(championship.completed_at)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-slate-400 text-sm">
                        {formatDate(championship.created_at)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        {/* Primary Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedChampionship(championship.id)}
                            className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-colors"
                          >
                            Halda
                          </button>
                          
                          {/* ADD RALLY BUTTON HERE */}
                          <button
                            onClick={() => setRallyModalChampionship({ id: championship.id, name: championship.name })}
                            className="px-3 py-1 text-sm bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded hover:bg-purple-600/30 transition-colors"
                          >
                            Rallid
                          </button>
                          
                          {!championship.is_active && (championship.total_rallies || 0) > 0 && (
                            <button
                              onClick={() => handleActivateChampionship(championship.id, championship.name)}
                              disabled={activateChampionshipMutation.isPending}
                              className="px-3 py-1 text-sm bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30 transition-colors disabled:opacity-50"
                            >
                              {activateChampionshipMutation.isPending ? 'Kinnitamine...' : 'Kinnita tulemused'}
                            </button>
                          )}

                          {!championship.is_active && (championship.total_rallies || 0) === 0 && (
                            <span className="px-3 py-1 text-xs text-slate-500 bg-slate-700/20 rounded">
                              Pole rallisid
                            </span>
                          )}
                        </div>

                        {/* Status Actions - Only for active championships */}
                        {championship.is_active && (
                          <div className="flex items-center gap-2">
                            {championship.status === 'ongoing' ? (
                              <button
                                onClick={() => handleCompleteChampionship(championship.id, championship.name)}
                                disabled={statusActionChampionship === championship.id}
                                className="px-3 py-1 text-sm bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded hover:bg-purple-600/30 transition-colors disabled:opacity-50"
                              >
                                {statusActionChampionship === championship.id ? 'Lõpetamine...' : '🏁 Märgi lõpetatuks'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReopenChampionship(championship.id, championship.name)}
                                disabled={statusActionChampionship === championship.id}
                                className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-colors disabled:opacity-50"
                              >
                                {statusActionChampionship === championship.id ? 'Avamine...' : '🔄 Ava uuesti'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Championship Modal */}
      {showCreateModal && (
        <CreateChampionshipModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            refetch()
          }}
        />
      )}

      {/* Championship Details Modal */}
      {selectedChampionship && (
        <ChampionshipDetailsModal
          championshipId={selectedChampionship}
          onClose={() => setSelectedChampionship(null)}
          onSuccess={() => {
            setSelectedChampionship(null)
            refetch()
          }}
        />
      )}

      {/* Rally Linking Modal */}
      {rallyModalChampionship && (
        <RallyLinkingModal
          championshipId={rallyModalChampionship.id}
          championshipName={rallyModalChampionship.name}
          isOpen={true}
          onClose={() => setRallyModalChampionship(null)}
          onSuccess={() => {
            setRallyModalChampionship(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}