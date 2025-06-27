// src/components/edetabel/rally-results/LoadingSpinner.tsx
'use client'

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <div 
          className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>
      </div>
      <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">LAADIN TULEMUSI...</p>
    </div>
  )
}

