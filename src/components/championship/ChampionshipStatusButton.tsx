// src/components/championship/ChampionshipStatusButton.tsx - Simple inline component
'use client'

import { useState } from 'react'
import { useCompleteChampionship, useReopenChampionship } from '@/hooks/useChampionshipManagement'

interface Championship {
  id: string
  name: string
  status: 'ongoing' | 'completed'
  completed_at?: string
}

interface ChampionshipStatusButtonProps {
  championship: Championship
  onStatusChange?: () => void
}

export function ChampionshipStatusButton({ championship, onStatusChange }: ChampionshipStatusButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  
  const completeChampionshipMutation = useCompleteChampionship()
  const reopenChampionshipMutation = useReopenChampionship()

  const handleComplete = async () => {
    try {
      const result = await completeChampionshipMutation.mutateAsync(championship.id)
      if (result.success) {
        alert('Meistrivõistlus märgitud lõpetatuks!')
        onStatusChange?.()
      } else {
        alert(result.error || 'Viga meistrivõistluse lõpetamisel')
      }
    } catch (error) {
      alert('Viga meistrivõistluse lõpetamisel')
    }
    setShowConfirm(false)
  }

  const handleReopen = async () => {
    try {
      const result = await reopenChampionshipMutation.mutateAsync(championship.id)
      if (result.success) {
        alert('Meistrivõistlus avatud uuesti!')
        onStatusChange?.()
      } else {
        alert(result.error || 'Viga meistrivõistluse avamisel')
      }
    } catch (error) {
      alert('Viga meistrivõistluse avamisel')
    }
    setShowConfirm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('et-EE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Status Badge */}
      <div className={`
        px-2 py-1 rounded-full text-xs font-medium border text-center min-w-[80px]
        ${championship.status === 'completed'
          ? 'bg-green-900/30 border-green-700/50 text-green-300'
          : 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300'
        }
      `}>
        {championship.status === 'completed' ? 'Lõpetatud' : 'Käimasolev'}
      </div>

      {/* Action Button */}
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={completeChampionshipMutation.isPending || reopenChampionshipMutation.isPending}
          className={`
            px-2 py-1 rounded text-xs font-medium transition-all duration-200 min-w-[70px]
            ${championship.status === 'completed'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {completeChampionshipMutation.isPending || reopenChampionshipMutation.isPending
            ? 'Töötleb...'
            : championship.status === 'completed'
            ? 'Ava uuesti'
            : 'Lõpeta'
          }
        </button>
      ) : (
        <div className="flex items-center space-x-1 bg-slate-800/50 rounded p-1">
          <span className="text-xs text-slate-300">Kindel?</span>
          <button
            onClick={championship.status === 'completed' ? handleReopen : handleComplete}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
          >
            Jah
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-2 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded"
          >
            Ei
          </button>
        </div>
      )}

      {/* Completion Date (if completed) */}
      {championship.status === 'completed' && championship.completed_at && (
        <div className="text-xs text-slate-400">
          {formatDate(championship.completed_at)}
        </div>
      )}
    </div>
  )
}