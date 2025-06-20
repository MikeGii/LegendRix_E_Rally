// src/components/admin/RallyStatusUpdateButton.tsx
'use client'

import { useState } from 'react'
import { useServerSideStatusUpdate } from '@/hooks/useOptimizedRallies'

interface RallyStatusUpdateButtonProps {
  className?: string
  showDetails?: boolean
}

export function RallyStatusUpdateButton({ 
  className = '', 
  showDetails = true 
}: RallyStatusUpdateButtonProps) {
  const [lastUpdate, setLastUpdate] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const serverUpdate = useServerSideStatusUpdate()

  const handleManualUpdate = async () => {
    if (confirm('Kas oled kindel, et soovid käsitsi uuendada kõikide rallide staatuseid?\n\nSee uuendab staatused kohe andmebaasis.')) {
      try {
        const result = await serverUpdate.mutateAsync()
        setLastUpdate(result)
        setShowResult(true)
        
        // Auto-hide result after 10 seconds
        setTimeout(() => setShowResult(false), 10000)
        
        alert(`✅ Staatuste uuendamine lõpetatud!\n\nUuendatud: ${result.updated} rallit\nKokku: ${result.total} rallit`)
      } catch (error) {
        console.error('Manual update failed:', error)
        alert(`❌ Staatuste uuendamine ebaõnnestus: ${error instanceof Error ? error.message : 'Tundmatu viga'}`)
      }
    }
  }

  const handleCronTest = async () => {
    if (confirm('Kas soovid testida automaatset cron teenust?\n\nSee kutsub välja /api/cron/rally-status-update endpoint\'i.')) {
      try {
        const response = await fetch('/api/cron/rally-status-update', {
          method: 'PUT', // Use PUT for manual admin trigger
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()
        
        if (response.ok) {
          setLastUpdate({ ...result, source: 'cron-test' })
          setShowResult(true)
          setTimeout(() => setShowResult(false), 15000)
          alert(`✅ Cron teenuse test lõpetatud!\n\nUuendatud: ${result.updated} rallit\nKokku: ${result.total} rallit`)
        } else {
          throw new Error(result.error || 'Cron test failed')
        }
      } catch (error) {
        console.error('Cron test failed:', error)
        alert(`❌ Cron teenuse test ebaõnnestus: ${error instanceof Error ? error.message : 'Tundmatu viga'}`)
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
    <div className={`space-y-4 ${className}`}>
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleManualUpdate}
          disabled={serverUpdate.isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200"
        >
          {serverUpdate.isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Uuendamine...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Uuenda rallide staatuseid</span>
            </>
          )}
        </button>

        <button
          onClick={handleCronTest}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
        >
          <span>🕐</span>
          <span>Testi cron teenust</span>
        </button>
      </div>

      {/* Results Display */}
      {showResult && lastUpdate && showDetails && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
              <span>{lastUpdate.source === 'cron-test' ? '🕐' : '🔄'}</span>
              <span>Viimane staatuste uuendamine</span>
            </h4>
            <button
              onClick={() => setShowResult(false)}
              className="text-slate-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-400 font-semibold">Uuendatud</div>
              <div className="text-2xl font-bold text-white">{lastUpdate.updated}</div>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-400 font-semibold">Kokku rallisid</div>
              <div className="text-2xl font-bold text-white">{lastUpdate.total}</div>
            </div>
            <div className="bg-slate-500/20 border border-slate-500/30 rounded-lg p-3">
              <div className="text-slate-400 font-semibold">Aeg</div>
              <div className="text-sm font-mono text-white">
                {formatTimestamp(lastUpdate.timestamp)}
              </div>
            </div>
          </div>

          {/* Show updates if any */}
          {lastUpdate.updates && lastUpdate.updates.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-slate-300">Uuendatud rallid:</h5>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {lastUpdate.updates.map((update: any, index: number) => (
                  <div key={index} className="text-xs bg-slate-700/50 rounded px-3 py-2">
                    <div className="font-medium text-white">{update.name}</div>
                    <div className="text-slate-400">
                      {update.oldStatus} → <span className="text-green-400">{update.newStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show errors if any */}
          {lastUpdate.errorDetails && lastUpdate.errorDetails.length > 0 && (
            <div className="space-y-2 mt-4">
              <h5 className="text-sm font-medium text-red-400">Vead:</h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {lastUpdate.errorDetails.map((error: any, index: number) => (
                  <div key={index} className="text-xs bg-red-900/30 border border-red-500/30 rounded px-3 py-2">
                    <div className="font-medium text-red-300">{error.name}</div>
                    <div className="text-red-400">{error.error}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Text */}
      <div className="text-xs text-slate-400 space-y-1">
        <div>• Staatused uuendatakse automaatselt vastavalt registreerimise tähtajale ja võistluse ajale</div>
        <div>• Rallid märgitakse "Lõppenud" staatusesse 1 tund pärast võistluse algust</div>
        {lastUpdate && (
          <div>• Viimane uuendamine: {formatTimestamp(lastUpdate.timestamp)}</div>
        )}
      </div>
    </div>
  )
}

// Export default for easier importing
export default RallyStatusUpdateButton