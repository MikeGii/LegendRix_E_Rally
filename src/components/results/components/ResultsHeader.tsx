// src/components/results/components/ResultsHeader.tsx
interface ResultsHeaderProps {
  editMode: boolean
  showAddParticipant: boolean
  onToggleEditMode: () => void
  onToggleAddParticipant: () => void
  onCalculatePositions: () => void
  onSaveResults: () => void
  isSaving?: boolean
}

export function ResultsHeader({
  editMode,
  showAddParticipant,
  onToggleEditMode,
  onToggleAddParticipant,
  onCalculatePositions,
  onSaveResults,
  isSaving = false
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-2">Tulemuste sisestamine</h3>
        <p className="text-slate-400 text-sm">
          Sisesta osalejate kohad ja punktid. Saad osalejaid ka eemaldada.
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAddParticipant}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <span className="text-lg">➕</span>
          Lisa osaleja
        </button>
        
        <button
          onClick={onToggleEditMode}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            editMode 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {editMode ? 'Lõpeta muutmine' : 'Alusta muutmist'}
        </button>
        
        {editMode && (
          <>
            <button
              onClick={onCalculatePositions}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
            >
              Arvuta kohad
            </button>
            
            <button
              onClick={onSaveResults}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvestan...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Salvesta tulemused
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}