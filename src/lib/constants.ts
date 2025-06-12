// src/lib/constants.ts - Universal Constants
export const GAME_CONSTANTS = {
  PLATFORMS: [
    'PC',
    'PlayStation 5',
    'Xbox Series X/S',
    'Nintendo Switch',
    'Mobile',
    'VR'
  ] as const,
  
  SKILL_LEVELS: [
    { value: 'beginner', label: 'Beginner', color: 'green' },
    { value: 'intermediate', label: 'Intermediate', color: 'blue' },
    { value: 'advanced', label: 'Advanced', color: 'orange' },
    { value: 'expert', label: 'Expert', color: 'red' }
  ] as const,
  
  SURFACE_TYPES: [
    'Tarmac',
    'Gravel',
    'Snow',
    'Ice',
    'Dirt',
    'Mixed'
  ] as const,
  
  DIFFICULTY_LEVELS: [
    { value: 'easy', label: 'Easy', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'hard', label: 'Hard', color: 'orange' },
    { value: 'extreme', label: 'Extreme', color: 'red' }
  ] as const,
  
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 100,
  MIN_YEAR: 1970,
  MAX_YEAR: new Date().getFullYear() + 5
} as const

export const QUERY_KEYS = {
  games: {
    all: ['games'] as const,
    lists: () => [...QUERY_KEYS.games.all, 'list'] as const,
    list: (filters?: any) => [...QUERY_KEYS.games.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.games.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.games.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    lists: () => [...QUERY_KEYS.users.all, 'list'] as const,
  },
  rallies: {
    all: ['rallies'] as const,
    lists: () => [...QUERY_KEYS.rallies.all, 'list'] as const,
  },
  gameTypes: (gameId?: string) => ['game-types', gameId] as const,
  gameEvents: (gameId?: string) => ['game-events', gameId] as const,
  gameClasses: (gameId?: string) => ['game-classes', gameId] as const,
  eventTracks: (eventId?: string) => ['event-tracks', eventId] as const,
} as const