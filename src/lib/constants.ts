// src/lib/constants.ts - CLEANED VERSION - Remove all unwanted constants
export const APP_CONFIG = {
  NAME: 'EWRC Admin',
  VERSION: '1.0.0',
  DESCRIPTION: 'E-Rally Championship Management System',
  
  // Database configuration
  DATABASE: {
    CONNECTION_TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    BATCH_SIZE: 50
  },
  
  // UI Configuration
  UI: {
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 5000,
    MODAL_ANIMATION_DURATION: 200,
    ITEMS_PER_PAGE: 25
  },
  
  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain']
  }
} as const

// Rally status constants
export const RALLY_STATUS = {
  UPCOMING: 'upcoming',
  REGISTRATION_OPEN: 'registration_open',
  REGISTRATION_CLOSED: 'registration_closed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export type RallyStatus = typeof RALLY_STATUS[keyof typeof RALLY_STATUS]

// User status constants
export const USER_STATUS = {
  PENDING_EMAIL: 'pending_email',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS]

// User role constants
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

// Registration status constants
export const REGISTRATION_STATUS = {
  REGISTERED: 'registered',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  DISQUALIFIED: 'disqualified',
  COMPLETED: 'completed'
} as const

export type RegistrationStatus = typeof REGISTRATION_STATUS[keyof typeof REGISTRATION_STATUS]

// Surface types
export const SURFACE_TYPES = {
  GRAVEL: 'gravel',
  TARMAC: 'tarmac',
  SNOW: 'snow',
  MIXED: 'mixed'
} as const

export type SurfaceType = typeof SURFACE_TYPES[keyof typeof SURFACE_TYPES]

// Centralized query keys - CLEANED
export const QUERY_KEYS = {
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...QUERY_KEYS.users.all, 'list'] as const,
    list: (filters?: any) => [...QUERY_KEYS.users.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.users.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.users.details(), id] as const,
    stats: () => [...QUERY_KEYS.users.all, 'stats'] as const,
  },
  
  // Rallies
  rallies: {
    all: ['rallies'] as const,
    lists: () => [...QUERY_KEYS.rallies.all, 'list'] as const,
    list: (filters?: any) => [...QUERY_KEYS.rallies.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.rallies.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.rallies.details(), id] as const,
    events: (rallyId: string) => [...QUERY_KEYS.rallies.all, 'events', rallyId] as const,
    classes: (rallyId: string) => [...QUERY_KEYS.rallies.all, 'classes', rallyId] as const,
    registrations: (rallyId: string) => [...QUERY_KEYS.rallies.all, 'registrations', rallyId] as const,
  },
  
  // Games
  games: {
    all: ['games'] as const,
    lists: () => [...QUERY_KEYS.games.all, 'list'] as const,
    list: (filters?: any) => [...QUERY_KEYS.games.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.games.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.games.details(), id] as const,
    types: (gameId: string) => [...QUERY_KEYS.games.all, 'types', gameId] as const,
    events: (gameId: string) => [...QUERY_KEYS.games.all, 'events', gameId] as const,
    classes: (gameId: string) => [...QUERY_KEYS.games.all, 'classes', gameId] as const,
    tracks: (eventId: string) => [...QUERY_KEYS.games.all, 'tracks', eventId] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...QUERY_KEYS.dashboard.all, 'stats'] as const,
    recent: () => [...QUERY_KEYS.dashboard.all, 'recent'] as const,
  }
} as const

// API endpoint constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    APPROVE: (id: string) => `/api/users/${id}/approve`,
    REJECT: (id: string) => `/api/users/${id}/reject`,
    STATS: '/api/users/stats'
  },
  
  RALLIES: {
    LIST: '/api/rallies',
    DETAIL: (id: string) => `/api/rallies/${id}`,
    EVENTS: (id: string) => `/api/rallies/${id}/events`,
    CLASSES: (id: string) => `/api/rallies/${id}/classes`,
    REGISTRATIONS: (id: string) => `/api/rallies/${id}/registrations`
  },
  
  GAMES: {
    LIST: '/api/games',
    DETAIL: (id: string) => `/api/games/${id}`,
    TYPES: (id: string) => `/api/games/${id}/types`,
    EVENTS: (id: string) => `/api/games/${id}/events`,
    CLASSES: (id: string) => `/api/games/${id}/classes`
  }
} as const

// Error messages
export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'You must be logged in to perform this action',
  ADMIN_REQUIRED: 'Administrator privileges required',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 8 characters long',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  SERVER_ERROR: 'Server error. Please try again later',
  NOT_FOUND: 'The requested resource was not found',
  
  // Business Logic
  DUPLICATE_ENTRY: 'This entry already exists',
  INVALID_OPERATION: 'This operation is not allowed',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions for this action'
} as const

// UI Theme colors
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  ERROR: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  SLATE: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
} as const

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_REALTIME: true,
  ENABLE_ANALYTICS: false,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_EXPORT: true,
  ENABLE_BULK_ACTIONS: true
} as const

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'ewrc_auth_token',
  USER_PREFERENCES: 'ewrc_user_preferences',
  THEME: 'ewrc_theme',
  SIDEBAR_COLLAPSED: 'ewrc_sidebar_collapsed',
  TABLE_SETTINGS: 'ewrc_table_settings',
  LAST_VISITED_PAGE: 'ewrc_last_page'
} as const

// Export utility type for creating discriminated unions
export type StatusOption<T extends Record<string, string>> = {
  value: T[keyof T]
  label: string
  color?: string
  icon?: string
}

// Utility function to create status options
export const createStatusOptions = <T extends Record<string, string>>(
  statuses: T,
  labels: Record<keyof T, string>,
  colors?: Record<keyof T, string>
): StatusOption<T>[] => {
  return Object.entries(statuses).map(([key, value]) => ({
    value: value as T[keyof T],
    label: labels[key as keyof T],
    color: colors?.[key as keyof T]
  }))
}