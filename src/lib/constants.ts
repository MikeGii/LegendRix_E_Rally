// src/lib/constants.ts - Universal constants and query keys
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

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  WAIVED: 'waived'
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// Surface types
export const SURFACE_TYPES = {
  GRAVEL: 'gravel',
  TARMAC: 'tarmac',
  SNOW: 'snow',
  MIXED: 'mixed'
} as const

export type SurfaceType = typeof SURFACE_TYPES[keyof typeof SURFACE_TYPES]

// Skill levels
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
} as const

export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS]

// Duration types
export const DURATION_TYPES = {
  SPRINT: 'sprint',
  NORMAL: 'normal',
  ENDURANCE: 'endurance'
} as const

export type DurationType = typeof DURATION_TYPES[keyof typeof DURATION_TYPES]

// Centralized query keys to prevent duplication
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
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',
  
  // Database
  CONNECTION_ERROR: 'Unable to connect to database',
  SAVE_ERROR: 'Failed to save changes',
  DELETE_ERROR: 'Failed to delete item',
  NOT_FOUND: 'Item not found',
  DUPLICATE_ENTRY: 'This entry already exists',
  
  // Rally specific
  RALLY_CREATE_ERROR: 'Failed to create rally',
  RALLY_UPDATE_ERROR: 'Failed to update rally',
  RALLY_DELETE_ERROR: 'Failed to delete rally',
  NO_EVENTS_SELECTED: 'Please select at least one event',
  NO_CLASSES_SELECTED: 'Please select at least one class',
  REGISTRATION_DEADLINE_PAST: 'Registration deadline must be in the future',
  COMPETITION_DATE_PAST: 'Competition date must be in the future',
  
  // File upload
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  
  // Network
  NETWORK_ERROR: 'Network connection error',
  SERVER_ERROR: 'Server error occurred',
  TIMEOUT_ERROR: 'Request timed out'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  REGISTER_SUCCESS: 'Registration successful',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  
  // Rally management
  RALLY_CREATED: 'Rally created successfully',
  RALLY_UPDATED: 'Rally updated successfully',
  RALLY_DELETED: 'Rally deleted successfully',
  
  // User management
  USER_APPROVED: 'User approved successfully',
  USER_REJECTED: 'User rejected successfully',
  USER_UPDATED: 'User updated successfully',
  
  // General
  SAVE_SUCCESS: 'Changes saved successfully',
  DELETE_SUCCESS: 'Item deleted successfully',
  UPLOAD_SUCCESS: 'File uploaded successfully'
} as const

// Validation rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 320
  },
  
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  },
  
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\-']+$/
  },
  
  RALLY_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200
  },
  
  DESCRIPTION: {
    MAX_LENGTH: 2000
  },
  
  PARTICIPANT_COUNT: {
    MIN: 1,
    MAX: 1000
  }
} as const

// Default values
export const DEFAULT_VALUES = {
  RALLY: {
    STATUS: RALLY_STATUS.UPCOMING,
    IS_FEATURED: false,
    IS_ACTIVE: true,
    ENTRY_FEE: 0,
    PRIZE_POOL: 0,
    POINTS_MULTIPLIER: 1.0,
    POINTS_WEIGHT: 1.0,
    ENTRY_FEE_MODIFIER: 1.0
  },
  
  USER: {
    ROLE: USER_ROLES.USER,
    STATUS: USER_STATUS.PENDING_EMAIL,
    EMAIL_VERIFIED: false,
    ADMIN_APPROVED: false
  },
  
  PAGINATION: {
    PAGE: 1,
    LIMIT: 25,
    MAX_LIMIT: 100
  }
} as const

// Date/Time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: 'yyyy-MM-ddTHH:mm',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSXXX',
  API: 'yyyy-MM-ddTHH:mm:ss.SSS'
} as const

// Sorting options
export const SORT_OPTIONS = {
  RALLIES: [
    { value: 'competition_date_desc', label: 'Competition Date (Newest)' },
    { value: 'competition_date_asc', label: 'Competition Date (Oldest)' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'created_at_desc', label: 'Created (Newest)' },
    { value: 'created_at_asc', label: 'Created (Oldest)' }
  ],
  
  USERS: [
    { value: 'created_at_desc', label: 'Joined (Newest)' },
    { value: 'created_at_asc', label: 'Joined (Oldest)' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'last_login_desc', label: 'Last Login (Recent)' }
  ]
} as const

// Filter options
export const FILTER_OPTIONS = {
  RALLY_STATUS: [
    { value: RALLY_STATUS.UPCOMING, label: 'Upcoming' },
    { value: RALLY_STATUS.REGISTRATION_OPEN, label: 'Registration Open' },
    { value: RALLY_STATUS.REGISTRATION_CLOSED, label: 'Registration Closed' },
    { value: RALLY_STATUS.ACTIVE, label: 'Active' },
    { value: RALLY_STATUS.COMPLETED, label: 'Completed' },
    { value: RALLY_STATUS.CANCELLED, label: 'Cancelled' }
  ],
  
  USER_STATUS: [
    { value: USER_STATUS.PENDING_EMAIL, label: 'Pending Email' },
    { value: USER_STATUS.PENDING_APPROVAL, label: 'Pending Approval' },
    { value: USER_STATUS.APPROVED, label: 'Approved' },
    { value: USER_STATUS.REJECTED, label: 'Rejected' }
  ],
  
  USER_ROLES: [
    { value: USER_ROLES.USER, label: 'User' },
    { value: USER_ROLES.ADMIN, label: 'Admin' }
  ]
} as const

// UI theme constants
export const THEME = {
  COLORS: {
    PRIMARY: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
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
  }
} as const

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  // Global
  SEARCH: 'cmd+k',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  
  // Navigation
  HOME: 'h',
  RALLIES: 'r',
  USERS: 'u',
  GAMES: 'g',
  
  // Actions
  CREATE_NEW: 'n',
  SAVE: 'cmd+s',
  DELETE: 'cmd+d',
  EDIT: 'e'
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