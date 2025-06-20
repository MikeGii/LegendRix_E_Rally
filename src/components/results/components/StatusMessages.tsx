// src/components/results/components/StatusMessages.tsx - SIMPLIFIED: Removed progress tracking
'use client'

import { CheckCircle, Loader2, Lock } from 'lucide-react'

interface StatusMessagesProps {
  isSaving: boolean
  isApproving: boolean
  isApproved: boolean
}

export function StatusMessages({ 
  isSaving, 
  isApproving, 
  isApproved 
}: StatusMessagesProps) {
  if (isApproved) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Lock className="text-green-400" size={20} />
          </div>
          <div>
            <p className="text-green-400 font-medium">Tulemused on kinnitatud</p>
            <p className="text-green-300/80 text-sm">
              Tulemused on lõplikult kinnitatud ja lukustatud. Muudatusi enam teha ei saa.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Loader2 className="text-blue-400 animate-spin" size={20} />
          </div>
          <div>
            <p className="text-blue-400 font-medium">Tulemuste salvestamine...</p>
            <p className="text-blue-300/80 text-sm">
              Palun oodake, kuni tulemused on salvestatud.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isApproving) {
    return (
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Loader2 className="text-orange-400 animate-spin" size={20} />
          </div>
          <div>
            <p className="text-orange-400 font-medium">Tulemuste kinnitamine...</p>
            <p className="text-orange-300/80 text-sm">
              Palun oodake, kuni tulemused on kinnitatud.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}