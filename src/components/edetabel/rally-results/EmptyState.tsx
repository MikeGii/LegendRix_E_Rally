// src/components/edetabel/rally-results/EmptyState.tsx
'use client'

export function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">🏁</span>
      </div>
      <p className="text-gray-400 text-lg">Tulemusi ei leitud</p>
    </div>
  )
}