// src/components/results/components/ResultsHeader.tsx - FIXED: Correct Estonian button names
'use client'

import { Calculator, Save, CheckCircle, UserPlus, Edit3, Lock } from 'lucide-react'

interface ResultsHeaderProps {
  editMode: boolean
  setEditMode: (value: boolean) => void
  onCalculatePositions: () => void
  onSaveResults: () => void
  onApproveResults?: () => void
  onShowAddParticipant: () => void
  isSaving: boolean
  isApproving: boolean
  isApproved: boolean
  canApprove: boolean
}

export function ResultsHeader({
  editMode,
  setEditMode,
  onCalculatePositions,
  onSaveResults,
  onApproveResults,
  onShowAddParticipant,
  isSaving,
  isApproving,
  isApproved,
  canApprove
}: ResultsHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Calculator className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tulemuste sisestamine</h1>
            <p className="text-slate-300">
              {isApproved ? 'Tulemused on kinnitatud ja lukustatud' : 'Sisesta punktid või eemalda mitteosalejad'}
            </p>
          </div>
        </div>

        {isApproved && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg">
            <Lock size={16} />
            <span className="font-medium">Kinnitatud</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!isApproved && (
            <>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  editMode
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700/70'
                }`}
              >
                <Edit3 size={16} />
                <span>{editMode ? 'Lõpeta muutmine' : 'Muuda'}</span>
              </button>

              {editMode && (
                <>
                  <button
                    onClick={onCalculatePositions}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-all duration-200"
                  >
                    <Calculator size={16} />
                    <span>Arvuta</span>
                  </button>

                  <button
                    onClick={onSaveResults}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Salvestan...' : 'Salvesta'}</span>
                  </button>

                  <button
                    onClick={onShowAddParticipant}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-200"
                  >
                    <UserPlus size={16} />
                    <span>Lisa osaleja</span>
                  </button>

                  {canApprove && onApproveResults && (
                    <button
                      onClick={onApproveResults}
                      disabled={isApproving}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      <span>{isApproving ? 'Kinnitamine...' : 'Kinnita tulemused'}</span>
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}