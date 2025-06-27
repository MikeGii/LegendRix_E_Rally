// src/components/edetabel/rally-results/RallyResultsAllClasses.tsx
'use client'

import { RallyResultsTable } from './RallyResultsTable'

interface RallyResultsAllClassesProps {
  sortedClasses: string[]
  resultsByClass: Record<string, any[]>
  onPlayerModalStateChange: (isOpen: boolean) => void
}

export function RallyResultsAllClasses({
  sortedClasses,
  resultsByClass,
  onPlayerModalStateChange
}: RallyResultsAllClassesProps) {
  return (
    <div className="space-y-8">
      {sortedClasses.map(className => (
        <div key={className} className="space-y-4">
          <h3 className="text-lg font-bold text-red-400 font-['Orbitron'] uppercase tracking-wider">
            {className}
          </h3>
          <RallyResultsTable 
            results={resultsByClass[className]}
            onPlayerModalStateChange={onPlayerModalStateChange}
          />
        </div>
      ))}
    </div>
  )
}