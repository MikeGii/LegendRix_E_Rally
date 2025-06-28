// src/components/registration/components/ClassSelector.tsx - FUTURISTIC CLASS SELECTOR
'use client'

interface ClassOption {
  id: string
  name: string
}

interface ClassSelectorProps {
  isAlreadyRegistered: boolean
  selectedClassId: string
  onClassSelect: (classId: string) => void
  availableClasses: ClassOption[]
  isLoading: boolean
}

export function ClassSelector({
  isAlreadyRegistered,
  selectedClassId,
  onClassSelect,
  availableClasses,
  isLoading
}: ClassSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(255,0,64,0.3)]">
          <span className="text-red-400 text-lg">🎯</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-['Orbitron'] uppercase tracking-wider">
            {isAlreadyRegistered ? 'Muuda klassi' : 'Vali klass'}
          </h3>
          <p className="text-gray-500 text-sm">
            {isAlreadyRegistered ? 'Vali uus klass või tühista registreering' : 'Vali klass, millega soovid osaleda'}
          </p>
        </div>
      </div>
      
      {/* Class Options */}
      {isLoading ? (
        <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-6">
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-['Orbitron'] uppercase tracking-wider text-sm">
              Laadin saadaolevaid klasse...
            </p>
          </div>
        </div>
      ) : availableClasses.length === 0 ? (
        <div className="tech-border rounded-xl bg-black/90 backdrop-blur-xl p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <span className="text-gray-500 text-2xl">🚫</span>
            </div>
            <p className="text-gray-400">Klasse pole veel lisatud.</p>
            <p className="text-gray-500 text-sm mt-2">
              Palun võtke ühendust korraldajatega.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {availableClasses.map((gameClass) => {
            const isSelected = selectedClassId === gameClass.id
            
            return (
              <label
                key={gameClass.id}
                className={`
                  relative cursor-pointer transition-all duration-300
                  ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
                `}
              >
                <input
                  type="radio"
                  name="class"
                  value={gameClass.id}
                  checked={isSelected}
                  onChange={(e) => onClassSelect(e.target.value)}
                  className="sr-only"
                />
                <div className={`
                  tech-border rounded-xl p-4 transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/50 shadow-[0_0_20px_rgba(255,0,64,0.3)]' 
                    : 'bg-black/90 hover:bg-gray-900/50 hover:border-gray-700'
                  }
                `}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                        ${isSelected 
                          ? 'bg-gradient-to-br from-red-600/30 to-red-500/20 border border-red-500/50 shadow-[0_0_10px_rgba(255,0,64,0.4)]' 
                          : 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700'
                        }
                      `}>
                        <span className={`text-lg ${isSelected ? 'text-red-400' : 'text-gray-400'}`}>
                          🏁
                        </span>
                      </div>
                      <div>
                        <h4 className={`
                          font-bold font-['Orbitron'] uppercase tracking-wider transition-colors
                          ${isSelected ? 'text-red-400' : 'text-white'}
                        `}>
                          {gameClass.name}
                        </h4>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,0,64,0.5)]">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Animated selection indicator */}
                  {isSelected && (
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-20 blur-sm animate-pulse"></div>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}