// src/components/championship/ChampionshipsManagement.tsx
'use client'

import { useState } from 'react'
import { useChampionships, useCreateChampionship, useActivateChampionship } from '@/hooks/useChampionshipManagement'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'

export function ChampionshipsManagement() {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedChampionship, setSelectedChampionship] = useState<string | null>(null)

  const { data: championships = [], isLoading, refetch } = useChampionships()
  const createChampionshipMutation = useCreateChampionship()
  const activateChampionshipMutation = useActivateChampionship()

  const handleCreateChampionship = () => {
    setIsCreating(true)
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
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Laen meistrivõistlusi...</span>
            </div>
          ) : championships.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pole veel meistrivõistlusi</h3>
              <p className="text-slate-400 mb-4">Loo esimene meistrivõistlus, et alustada</p>
              <button
                onClick={handleCreateChampionship}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Loo meistrivõistlus
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-slate-400 font-medium">Nimi</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Hooaeg</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Mäng</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Rallisid</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Staatus</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Loodud</th>
                  <th className="px-6 py-4 text-slate-400 font-medium">Tegevused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {championships.map((championship) => (
                  <tr 
                    key={championship.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{championship.name}</div>
                        {championship.description && (
                          <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {championship.description}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{championship.season_year}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-white">{championship.game_name || '-'}</div>
                        {championship.game_type_name && (
                          <div className="text-slate-400">{championship.game_type_name}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{championship.total_rallies || 0}</span>
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
                        
                        {!championship.is_active && (
                          <button
                            onClick={() => handleActivateChampionship(championship.id, championship.name)}
                            disabled={activateChampionshipMutation.isPending}
                            className="px-3 py-1 text-sm bg-green-600/20 text-green-400 border border-green-600/30 rounded hover:bg-green-600/30 transition-colors disabled:opacity-50"
                          >
                            {activateChampionshipMutation.isPending ? 'Kinnitab...' : 'Kinnita'}
                          </button>
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
      {isCreating && (
        <CreateChampionshipModal
          onClose={() => setIsCreating(false)}
          onSuccess={() => setIsCreating(false)}
        />
      )}

      {/* Championship Details Modal */}
      {selectedChampionship && (
        <ChampionshipDetailsModal
          championshipId={selectedChampionship}
          onClose={() => setSelectedChampionship(null)}
        />
      )}
    </div>
  )
}

// Create Championship Modal Component
function CreateChampionshipModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season_year: new Date().getFullYear()
  })

  const createChampionshipMutation = useCreateChampionship()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createChampionshipMutation.mutateAsync(formData)
      onSuccess()
    } catch (error) {
      console.error('Error creating championship:', error)
      alert('Viga meistrivõistluse loomisel')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-md">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Loo meistrivõistlus</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nimi *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="nt. WRC 2025 Championship"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Kirjeldus
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Meistrivõistluse kirjeldus..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hooaeg
            </label>
            <input
              type="number"
              value={formData.season_year}
              onChange={(e) => setFormData(prev => ({ ...prev, season_year: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={2020}
              max={2030}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Tühista
            </button>
            <button
              type="submit"
              disabled={createChampionshipMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {createChampionshipMutation.isPending ? 'Loon...' : 'Loo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Championship Details Modal Component (placeholder)
function ChampionshipDetailsModal({ championshipId, onClose }: { championshipId: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Meistrivõistluse haldus</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-400">
            Championship details view coming in next step...
            <br />
            Championship ID: {championshipId}
          </p>
        </div>
      </div>
    </div>
  )
}