// src/components/results/components/StatusMessages.tsx
interface StatusMessagesProps {
  removeError?: string | null
  saveError?: string | null
  saveSuccess?: boolean
  isSaving?: boolean
}

export function StatusMessages({ 
  removeError, 
  saveError, 
  saveSuccess, 
  isSaving 
}: StatusMessagesProps) {
  return (
    <div className="space-y-4">
      {/* Remove Error */}
      {removeError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-400 text-lg mr-3">❌</span>
            <div>
              <p className="text-red-400 font-medium">Viga osaleja eemaldamisel</p>
              <p className="text-red-300 text-sm mt-1">{removeError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Error */}
      {saveError && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-400 text-lg mr-3">❌</span>
            <div>
              <p className="text-red-400 font-medium">Viga tulemuste salvestamisel</p>
              <p className="text-red-300 text-sm mt-1">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Success */}
      {saveSuccess && !isSaving && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-400 text-lg mr-3">✅</span>
            <p className="text-green-400 font-medium">Tulemused edukalt salvestatud!</p>
          </div>
        </div>
      )}
    </div>
  )
}