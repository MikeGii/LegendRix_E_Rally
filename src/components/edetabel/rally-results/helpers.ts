// src/components/edetabel/rally-results/helpers.ts

// Position color helper
export function getPositionColor(position: number | null): string {
  if (!position) return 'text-gray-400'
  if (position === 1) return 'text-yellow-400'
  if (position === 2) return 'text-gray-300'
  if (position === 3) return 'text-orange-400'
  return 'text-gray-400'
}

// Podium icon helper
export function getPodiumIcon(position: number | null): string {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return ''
}

// Class priority helper
export function getClassPriority(className: string): number {
  const lowerName = className.toLowerCase()
  if (lowerName.includes('pro') && !lowerName.includes('semi')) {
    return 1 // Pro class has highest priority
  }
  if (lowerName.includes('semi') && lowerName.includes('pro')) {
    return 2 // Semi-Pro class has second priority
  }
  return 3 // All other classes
}