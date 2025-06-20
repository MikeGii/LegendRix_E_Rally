// src/components/admin/RallyManagementHeader.tsx - UPDATED VERSION
'use client'

import { useState } from 'react'
import { useServerSideStatusUpdate } from '@/hooks/useOptimizedRallies'

interface RallyManagementHeaderProps {
  totalRallies: number
  onCreateRally: () => void
  onRefresh: () => void
  isLoading: boolean
}

export function RallyManagementHeader({ 
  totalRallies, 
  onCreateRally, 
  onRefresh, 
  isLoading 
}: RallyManagementHeaderProps) {
  const [lastUpdate, setLastUpdate] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const serverUpdate = useServerSideStatusUpdate()

  const handleBackToAdmin = () => {
    window.location.href = '/admin-dashboard'
  }

  const handleStatusUpdate = async () => {
    if (confirm('Kas oled kindel, et soovid käsitsi uuendada kõikide rallide staatuseid?\n\nSee uuendab staatused kohe andmebaasis.')) {
      try {
        const result = await serverUpdate.mutateAsync()
        setLastUpdate(result)
        setShowResult(true)
        
        // Auto-hide result after 10 seconds
        setTimeout(() => setShowResult(false), 10000)
        
        alert(`✅ Staatuste uuendamine lõpetatud!\n\nUuendatud: ${result.updated} rallit\nKokku: ${result.total} rallit`)
        
        // Also refresh the rallies list
        onRefresh()
      } catch (error) {
        console.error('Manual update failed:', error)
        alert(`❌ Staatuste uuendamine ebaõnnestus: ${error instanceof Error ? error.message : 'Tundmatu viga'}`)
      }
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('et-EE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <button
                onClick={handleBackToAdmin}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <span>←</span>
                <span>Tagasi admin töölauale</span>
              </button>
              <h1 className="text-3xl font-bold text-white">Rally juhtimine</h1>
            </div>
            <p className="text-slate-400 mb-4">Loo ja halda ralli võistlusi kasutades mängu andmeid</p>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-sm text-slate-300">Kokku rallisid: {totalRallies}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-sm text-slate-300">Aktiivseid: {totalRallies}</span>
              </div>
              {lastUpdate && (
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  <span className="text-sm text-slate-300">
                    Viimane staatuste uuendamine: {formatTimestamp(lastUpdate.timestamp)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Rally Status Update Button */}
            <button
              onClick={handleStatusUpdate}
              disabled={serverUpdate.isPending || isLoading}
              className="flex items-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              {serverUpdate.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Uuendamine...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Uuenda staatuseid</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading || serverUpdate.isPending}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Laadimas...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Värskenda</span>
                </div>
              )}
            </button>
            
            {/* Create Rally Button */}
            <button
              onClick={onCreateRally}
              disabled={isLoading || serverUpdate.isPending}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              <div className="flex items-center space-x-2">
                <span>➕</span>
                <span>Loo rally</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Results */}
      {showResult && lastUpdate && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <span>⚡</span>
              <span>Rallide staatuste uuendamise tulemus</span>
            </h4>
            <button
              onClick={() => setShowResult(false)}
              className="text-slate-400 hover:text-white text-xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <div className="text-green-400 font-semibold">Uuendatud rallisid</div>
              <div className="text-2xl font-bold text-white">{lastUpdate.updated}</div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-blue-400 font-semibold">Kokku rallisid</div>
              <div className="text-2xl font-bold text-white">{lastUpdate.total}</div>
            </div>
            <div className="bg-slate-500/20 border border-slate-500/30 rounded-lg p-4">
              <div className="text-slate-400 font-semibold">Uuendamise aeg</div>
              <div className="text-sm font-mono text-white">
                {formatTimestamp(lastUpdate.timestamp)}
              </div>
            </div>
          </div>

          {/* Show updated rallies if any */}
          {lastUpdate.updates && lastUpdate.updates.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-slate-300">Uuendatud rallid:</h5>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {lastUpdate.updates.map((update: any, index: number) => (
                  <div key={index} className="bg-slate-700/50 rounded-lg px-4 py-3">
                    <div className="font-medium text-white">{update.name}</div>
                    <div className="text-sm text-slate-400">
                      Staatus muutus: <span className="text-yellow-400">{update.oldStatus}</span> → <span className="text-green-400">{update.newStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show errors if any */}
          {lastUpdate.errorDetails && lastUpdate.errorDetails.length > 0 && (
            <div className="space-y-3 mt-4">
              <h5 className="text-sm font-medium text-red-400">Vead uuendamisel:</h5>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {lastUpdate.errorDetails.map((error: any, index: number) => (
                  <div key={index} className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3">
                    <div className="font-medium text-red-300">{error.name}</div>
                    <div className="text-sm text-red-400">{error.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}