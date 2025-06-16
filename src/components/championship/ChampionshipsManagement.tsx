// src/components/championship/ChampionshipsManagement.tsx - COMPLETE VERSION
'use client'

import { useState } from 'react'
import { useChampionships, useCreateChampionship, useActivateChampionship } from '@/hooks/useChampionshipManagement'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { CreateChampionshipModal } from './CreateChampionshipModal'
import { ChampionshipDetailsModal } from './ChampionshipDetailsModal'

export function ChampionshipsManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedChampionship, setSelectedChampionship] = useState<string | null>(null)

  const { data: championships = [], isLoading, refetch } = useChampionships()
  const activateChampionshipMutation = useActivateChampionship()

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
      } catch (error) {
        console.error('Error activating championship:', error)
        alert('Viga kinnitamisel. Palun proovi uuesti.')
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
          <h2 className="text-xl font-bold text-white">Meistrivõistluste nimekiri</h2>
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
                      <span className="text-slate-400 text-sm">
                        {formatDate(championship.created_at)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedChampionship(championship.id)}
                          className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30 transition-colors"
                        >
                          Halda
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
    </div>
  )
}