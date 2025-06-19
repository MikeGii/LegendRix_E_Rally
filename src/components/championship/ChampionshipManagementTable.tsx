// src/components/championship/ChampionshipManagementTable.tsx - Updated version
'use client'

import { useState } from 'react'
import { useChampionships } from '@/hooks/useChampionshipManagement'
import { ChampionshipStatusButton } from './ChampionshipStatusButton'

export function ChampionshipManagementTable() {
  const { data: championships = [], isLoading, refetch } = useChampionships()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Meistrivõistluste nimekiri</h2>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-700/30 rounded h-16"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Meistrivõistluste nimekiri</h2>
          <div className="text-sm text-slate-400">
            Kokku: {championships.length} • Lõpetatud: {championships.filter(c => c.status === 'completed').length}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {championships.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-white mb-2">Pole meistrivõistlusi</h3>
            <p className="text-slate-400">Loo esimene meistrivõistlus, et alustada.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/30 border-b border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Nimi</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Hooaeg</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Mäng</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Rallid</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Staatus</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Loodud</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Tegevused</th>
              </tr>
            </thead>
            <tbody>
              {championships.map((championship) => (
                <tr key={championship.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="font-medium text-white">{championship.name}</div>
                    {championship.description && (
                      <div className="text-sm text-slate-400 mt-1">{championship.description}</div>
                    )}
                  </td>
                  <td className="p-4 text-slate-300">{championship.season_year}</td>
                  <td className="p-4">
                    <div className="text-slate-300">{championship.game_name || 'Pole määratud'}</div>
                    <div className="text-sm text-slate-500">{championship.game_type_name || 'Pole määratud'}</div>
                  </td>
                  <td className="p-4 text-slate-300">{championship.total_rallies}</td>
                  <td className="p-4">
                    <ChampionshipStatusButton 
                      championship={championship} 
                      onStatusChange={refetch}
                    />
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {formatDate(championship.created_at)}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.location.href = `/admin/championships/${championship.id}`}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                      >
                        Vaata
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin/championships/${championship.id}/edit`}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors"
                      >
                        Muuda
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}