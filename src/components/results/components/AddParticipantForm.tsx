// src/components/results/components/AddParticipantForm.tsx
import type { ManualParticipant } from '../hooks/useResultsState'

interface AddParticipantFormProps {
  show: boolean
  participant: ManualParticipant
  rallyClasses: any[]
  isAdding: boolean
  onParticipantChange: (participant: ManualParticipant) => void
  onSubmit: () => void
  onCancel: () => void
}

export function AddParticipantForm({
  show,
  participant,
  rallyClasses,
  isAdding,
  onParticipantChange,
  onSubmit,
  onCancel
}: AddParticipantFormProps) {
  if (!show) return null

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 mb-6">
      <h4 className="text-lg font-semibold text-white mb-4">Lisa käsitsi osaleja</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Mängija nimi
          </label>
          <input
            type="text"
            value={participant.playerName}
            onChange={(e) => onParticipantChange({ ...participant, playerName: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Sisesta mängija nimi"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Klass
          </label>
          <select
            value={participant.className}
            onChange={(e) => onParticipantChange({ ...participant, className: e.target.value })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {rallyClasses.map((cls: any) => (
              <option key={cls.id} value={cls.class_name}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
        >
          Tühista
        </button>
        <button
          onClick={onSubmit}
          disabled={!participant.playerName.trim() || !participant.className.trim() || isAdding}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg transition-colors"
        >
          {isAdding ? 'Lisan...' : 'Lisa osaleja'}
        </button>
      </div>
      
      {rallyClasses.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ Rallil pole klasse konfigureeritud. Mine Rally Management lehele ja lisa klassid.
          </p>
        </div>
      )}
    </div>
  )
}