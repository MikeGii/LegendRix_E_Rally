// src/components/championship/participant-tabs/ManageAliasesTab.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ManualParticipant } from '../ParticipantLinkingInterface'

interface ManageAliasesTabProps {
  linkedParticipants: ManualParticipant[]
  onRefreshData: () => Promise<void>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

interface AliasWithUsage {
  alias_name: string
  used_count: number
  manual_participant_id: string
}

export function ManageAliasesTab({
  linkedParticipants,
  onRefreshData,
  isLoading,
  setIsLoading
}: ManageAliasesTabProps) {
  const [editingParticipant, setEditingParticipant] = useState<ManualParticipant | null>(null)
  const [newAlias, setNewAlias] = useState('')
  const [aliasUsageStats, setAliasUsageStats] = useState<Record<string, AliasWithUsage[]>>({})
  const [showUsageStats, setShowUsageStats] = useState(false)

  // Load alias usage statistics
  const loadAliasUsageStats = async () => {
    try {
      const { data: aliases, error } = await supabase
        .from('participant_aliases')
        .select('manual_participant_id, alias_name, used_count')
        .order('used_count', { ascending: false })

      if (error) throw error

      const stats: Record<string, AliasWithUsage[]> = {}
      aliases?.forEach(alias => {
        if (!stats[alias.manual_participant_id]) {
          stats[alias.manual_participant_id] = []
        }
        stats[alias.manual_participant_id].push(alias)
      })

      setAliasUsageStats(stats)
    } catch (error) {
      console.error('Error loading alias usage stats:', error)
    }
  }

  const addAlias = async (participantId: string) => {
    if (!newAlias.trim()) return

    const aliasName = newAlias.trim()
    
    // Check if alias already exists for this participant
    const participant = linkedParticipants.find(p => p.id === participantId)
    if (participant?.aliases.includes(aliasName)) {
      alert('See alias on juba olemas!')
      return
    }

    // Check if alias exists for another participant
    const existingParticipant = linkedParticipants.find(p => 
      p.id !== participantId && p.aliases.includes(aliasName)
    )
    if (existingParticipant) {
      if (!confirm(`Alias "${aliasName}" on juba kasutusel osaleja "${existingParticipant.display_name}" juures. Kas tahad siiski jätkata?`)) {
        return
      }
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('participant_aliases')
        .insert({
          manual_participant_id: participantId,
          alias_name: aliasName,
          used_count: 0
        })

      if (error) throw error

      setNewAlias('')
      setEditingParticipant(null)
      await onRefreshData()
      if (showUsageStats) {
        await loadAliasUsageStats()
      }
      alert('Alias lisatud!')
    } catch (error: any) {
      console.error('Error adding alias:', error)
      if (error.code === '23505') { // Unique constraint violation
        alert('See alias on juba kasutusel!')
      } else {
        alert('Viga aliase lisamisel')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeAlias = async (participantId: string, aliasName: string) => {
    if (!confirm(`Kas oled kindel, et tahad eemaldada aliase "${aliasName}"?`)) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('participant_aliases')
        .delete()
        .eq('manual_participant_id', participantId)
        .eq('alias_name', aliasName)

      if (error) throw error

      await onRefreshData()
      if (showUsageStats) {
        await loadAliasUsageStats()
      }
      alert('Alias eemaldatud!')
    } catch (error) {
      console.error('Error removing alias:', error)
      alert('Viga aliase eemaldamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const updateAliasUsageCount = async (participantId: string, aliasName: string, newCount: number) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('participant_aliases')
        .update({ used_count: newCount })
        .eq('manual_participant_id', participantId)
        .eq('alias_name', aliasName)

      if (error) throw error

      await loadAliasUsageStats()
      alert('Kasutusarv uuendatud!')
    } catch (error) {
      console.error('Error updating alias usage:', error)
      alert('Viga kasutusarvu uuendamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const bulkAddAliases = async (participantId: string, aliasesText: string) => {
    const aliases = aliasesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (aliases.length === 0) return

    if (!confirm(`Kas tahad lisada ${aliases.length} aliast?`)) return

    setIsLoading(true)
    let addedCount = 0
    let errorCount = 0

    try {
      for (const aliasName of aliases) {
        try {
          await supabase
            .from('participant_aliases')
            .insert({
              manual_participant_id: participantId,
              alias_name: aliasName,
              used_count: 0
            })
          addedCount++
        } catch (error: any) {
          if (error.code !== '23505') { // Ignore unique constraint violations
            console.error('Error adding alias:', aliasName, error)
          }
          errorCount++
        }
      }

      await onRefreshData()
      if (showUsageStats) {
        await loadAliasUsageStats()
      }
      
      alert(`Hulgilisamise tulemus:\nLisatud: ${addedCount}\nVigaseid/duplikaate: ${errorCount}`)
    } catch (error) {
      console.error('Error in bulk add aliases:', error)
      alert('Viga hulgilisamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const findUnusedAliases = async () => {
    try {
      const { data: unusedAliases, error } = await supabase
        .from('participant_aliases')
        .select(`
          manual_participant_id,
          alias_name,
          used_count,
          manual_participants!inner(display_name)
        `)
        .eq('used_count', 0)
        .order('manual_participants(display_name)')

      if (error) throw error

      if (unusedAliases && unusedAliases.length > 0) {
        let message = `Leitud ${unusedAliases.length} kasutamata aliast:\n\n`
        unusedAliases.forEach(alias => {
          message += `• ${alias.alias_name} (${(alias.manual_participants as any)?.display_name})\n`
        })
        alert(message)
      } else {
        alert('Kasutamata aliaseid ei leitud!')
      }
    } catch (error) {
      console.error('Error finding unused aliases:', error)
      alert('Viga kasutamata aliaste otsimisel')
    }
  }

  const handleShowUsageStats = async () => {
    if (!showUsageStats) {
      await loadAliasUsageStats()
    }
    setShowUsageStats(!showUsageStats)
  }

  const findDuplicateAliases = async () => {
    try {
      const { data: duplicateAliases, error } = await supabase
        .from('participant_aliases')
        .select(`
          alias_name,
          manual_participant_id,
          manual_participants!inner(display_name)
        `)
        .order('alias_name')

      if (error) throw error

      // Group by alias name to find duplicates
      const aliasGroups: Record<string, any[]> = {}
      duplicateAliases?.forEach(alias => {
        if (!aliasGroups[alias.alias_name]) {
          aliasGroups[alias.alias_name] = []
        }
        aliasGroups[alias.alias_name].push(alias)
      })

      const duplicates = Object.entries(aliasGroups)
        .filter(([_, aliases]) => aliases.length > 1)

      if (duplicates.length > 0) {
        let message = `Leitud ${duplicates.length} duplikaat aliast:\n\n`
        duplicates.forEach(([aliasName, aliases]) => {
          message += `"${aliasName}":\n`
          aliases.forEach(alias => {
            message += `  - ${(alias.manual_participants as any)?.display_name}\n`
          })
          message += '\n'
        })
        alert(message)
      } else {
        alert('Duplikaat aliaseid ei leitud!')
      }
    } catch (error) {
      console.error('Error finding duplicate aliases:', error)
      alert('Viga duplikaatide otsimisel')
    }
  }

  const deleteUnusedAliases = async () => {
    if (!confirm('Kas oled kindel, et tahad kustutada kõik kasutamata aliased?')) return
    
    setIsLoading(true)
    try {
      const { data: deleted, error } = await supabase
        .from('participant_aliases')
        .delete()
        .eq('used_count', 0)
        .select()

      if (error) throw error

      await onRefreshData()
      if (showUsageStats) {
        await loadAliasUsageStats()
      }
      
      alert(`Kustutatud ${deleted?.length || 0} kasutamata aliast!`)
    } catch (error) {
      console.error('Error deleting unused aliases:', error)
      alert('Viga kasutamata aliaste kustutamisel')
    } finally {
      setIsLoading(false)
    }
  }

  const showTopAliases = async () => {
    try {
      const { data: aliasStats, error } = await supabase
        .from('participant_aliases')
        .select('alias_name, used_count')
        .order('used_count', { ascending: false })
        .limit(20)

      if (error) throw error

      if (aliasStats && aliasStats.length > 0) {
        let message = 'Top 20 enim kasutatud aliast:\n\n'
        aliasStats.forEach((alias, index) => {
          message += `${index + 1}. ${alias.alias_name} (${alias.used_count}x)\n`
        })
        alert(message)
      } else {
        alert('Aliaste statistikat ei leitud!')
      }
    } catch (error) {
      console.error('Error getting alias statistics:', error)
      alert('Viga statistika laadimisel')
    }
  }

  const searchAliases = async () => {
    const searchTerm = prompt('Otsi aliast:')
    if (!searchTerm) return

    try {
      const { data: foundAliases, error } = await supabase
        .from('participant_aliases')
        .select(`
          alias_name,
          used_count,
          manual_participants!inner(display_name)
        `)
        .ilike('alias_name', `%${searchTerm}%`)
        .order('used_count', { ascending: false })

      if (error) throw error

      if (foundAliases && foundAliases.length > 0) {
        let message = `Leitud ${foundAliases.length} aliast otsinguga "${searchTerm}":\n\n`
        foundAliases.forEach(alias => {
          message += `• ${alias.alias_name} (${alias.used_count}x) - ${(alias.manual_participants as any)?.display_name}\n`
        })
        alert(message)
      } else {
        alert('Aliaseid ei leitud!')
      }
    } catch (error) {
      console.error('Error searching aliases:', error)
      alert('Viga otsimisel')
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-white">Halda aliaseid</h3>
          <div className="flex space-x-2">
            <button
              onClick={findUnusedAliases}
              className="px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded text-sm hover:bg-yellow-600/30"
              disabled={isLoading}
            >
              Kasutamata aliased
            </button>
            <button
              onClick={handleShowUsageStats}
              className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded text-sm hover:bg-purple-600/30"
              disabled={isLoading}
            >
              {showUsageStats ? 'Peida statistika' : 'Näita statistikat'}
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-sm">Lisa, muuda või eemalda osaleja aliaseid</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-6">
          {linkedParticipants.map((participant) => (
            <div key={participant.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-white">{participant.display_name}</h4>
                  <p className="text-sm text-slate-400">{participant.total_rallies} rallid • {participant.total_results} tulemust</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const text = prompt('Lisa aliased (üks rea kohta):')
                      if (text) bulkAddAliases(participant.id, text)
                    }}
                    className="px-2 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded text-xs hover:bg-green-600/30"
                    disabled={isLoading}
                  >
                    Hulgi+
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-slate-300">Aliased:</div>
                <div className="flex flex-wrap gap-2">
                  {participant.aliases.map((alias) => {
                    const usage = showUsageStats ? aliasUsageStats[participant.id]?.find(a => a.alias_name === alias) : null
                    return (
                      <div key={alias} className="flex items-center bg-slate-600/30 rounded px-3 py-2">
                        <span className="text-sm text-white">{alias}</span>
                        {showUsageStats && usage && (
                          <span className="ml-2 text-xs text-slate-400">
                            ({usage.used_count}x)
                          </span>
                        )}
                        <button
                          onClick={() => removeAlias(participant.id, alias)}
                          className="ml-2 text-red-400 hover:text-red-300 text-sm"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                  {participant.aliases.length === 0 && (
                    <span className="text-sm text-slate-500">Aliaseid pole lisatud</span>
                  )}
                </div>
                
                {/* Usage statistics details */}
                {showUsageStats && aliasUsageStats[participant.id] && (
                  <div className="mt-4 p-3 bg-slate-600/20 rounded">
                    <div className="text-sm text-slate-300 mb-2">Aliaste kasutusstatistika:</div>
                    <div className="space-y-1">
                      {aliasUsageStats[participant.id].map((alias) => (
                        <div key={alias.alias_name} className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">{alias.alias_name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400">{alias.used_count} korda</span>
                            <button
                              onClick={() => {
                                const newCount = prompt(`Uus kasutusarv aliasele "${alias.alias_name}":`, alias.used_count.toString())
                                if (newCount !== null) {
                                  const count = parseInt(newCount)
                                  if (!isNaN(count) && count >= 0) {
                                    updateAliasUsageCount(participant.id, alias.alias_name, count)
                                  }
                                }
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300"
                              disabled={isLoading}
                            >
                              Muuda
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add new alias */}
                <div className="flex space-x-2 mt-3">
                  <input
                    type="text"
                    placeholder="Uus alias..."
                    value={editingParticipant?.id === participant.id ? newAlias : ''}
                    onChange={(e) => {
                      setNewAlias(e.target.value)
                      setEditingParticipant(participant)
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addAlias(participant.id)
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => addAlias(participant.id)}
                    disabled={!newAlias.trim() || isLoading || editingParticipant?.id !== participant.id}
                    className="px-3 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded text-sm hover:bg-green-600/30 disabled:opacity-50"
                  >
                    Lisa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global alias management tools */}
        <div className="mt-8 p-6 bg-slate-700/20 rounded-lg border border-slate-600">
          <h4 className="font-medium text-white mb-4">Globaalne aliaste haldus</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={findDuplicateAliases}
              className="px-4 py-2 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded hover:bg-orange-600/30"
              disabled={isLoading}
            >
              Otsi duplikaate
            </button>

            <button
              onClick={deleteUnusedAliases}
              className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded hover:bg-red-600/30"
              disabled={isLoading}
            >
              Kustuta kasutamata
            </button>

            <button
              onClick={showTopAliases}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded hover:bg-blue-600/30"
              disabled={isLoading}
            >
              Top aliased
            </button>

            <button
              onClick={searchAliases}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded hover:bg-purple-600/30"
              disabled={isLoading}
            >
              Otsi aliast
            </button>
          </div>

          {/* Additional global tools */}
          <div className="mt-4 pt-4 border-t border-slate-600">
            <h5 className="text-sm font-medium text-slate-300 mb-3">Täpsemad tööriistad</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={async () => {
                  try {
                    const { data: totalStats, error } = await supabase
                      .from('participant_aliases')
                      .select('used_count')

                    if (error) throw error

                    const total = totalStats?.length || 0
                    const totalUsage = totalStats?.reduce((sum, alias) => sum + alias.used_count, 0) || 0
                    const unused = totalStats?.filter(alias => alias.used_count === 0).length || 0
                    const avgUsage = total > 0 ? (totalUsage / total).toFixed(2) : 0

                    alert(`Aliaste üldstatistika:\n\nKokku aliaseid: ${total}\nKasutamata: ${unused}\nKeskmine kasutus: ${avgUsage}\nKokku kasutusi: ${totalUsage}`)
                  } catch (error) {
                    console.error('Error getting total stats:', error)
                    alert('Viga statistika laadimisel')
                  }
                }}
                className="px-3 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded text-sm hover:bg-indigo-600/30"
                disabled={isLoading}
              >
                Üldstatistika
              </button>

              <button
                onClick={async () => {
                  const minUsage = prompt('Minimaalne kasutusarv:')
                  if (!minUsage) return

                  const threshold = parseInt(minUsage)
                  if (isNaN(threshold)) return

                  try {
                    const { data: popularAliases, error } = await supabase
                      .from('participant_aliases')
                      .select(`
                        alias_name,
                        used_count,
                        manual_participants!inner(display_name)
                      `)
                      .gte('used_count', threshold)
                      .order('used_count', { ascending: false })

                    if (error) throw error

                    if (popularAliases && popularAliases.length > 0) {
                      let message = `Aliased kasutusega ≥${threshold}:\n\n`
                      popularAliases.forEach(alias => {
                        message += `• ${alias.alias_name} (${alias.used_count}x) - ${(alias.manual_participants as any)?.display_name}\n`
                      })
                      alert(message)
                    } else {
                      alert(`Ei leitud aliaseid kasutusega ≥${threshold}`)
                    }
                  } catch (error) {
                    console.error('Error finding popular aliases:', error)
                    alert('Viga populaarsete aliaste otsimisel')
                  }
                }}
                className="px-3 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded text-sm hover:bg-emerald-600/30"
                disabled={isLoading}
              >
                Populaarsed
              </button>

              <button
                onClick={async () => {
                  if (!confirm('Kas tahad lähtestada kõik kasutusarvud nulliks? Seda ei saa tagasi võtta!')) return

                  setIsLoading(true)
                  try {
                    const { error } = await supabase
                      .from('participant_aliases')
                      .update({ used_count: 0 })
                      .neq('used_count', null)

                    if (error) throw error

                    if (showUsageStats) {
                      await loadAliasUsageStats()
                    }
                    
                    alert('Kõik kasutusarvud lähtestatud!')
                  } catch (error) {
                    console.error('Error resetting usage counts:', error)
                    alert('Viga kasutusarvude lähtestamisel')
                  } finally {
                    setIsLoading(false)
                  }
                }}
                className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-sm hover:bg-red-600/30"
                disabled={isLoading}
              >
                Lähtesta arvud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}