// src/lib/utils.ts - Clean utilities with no external dependencies
import { 
  VALIDATION_RULES, 
  DATE_FORMATS, 
  ERROR_MESSAGES,
  RALLY_STATUS,
  USER_STATUS,
  type RallyStatus,
  type UserStatus 
} from './constants'

// Simple class name utility
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

// ============= Date Utilities =============
export const formatDate = (date: string | Date, format: keyof typeof DATE_FORMATS = 'DISPLAY'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date'
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }

  if (format === 'DISPLAY_WITH_TIME') {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return dateObj.toLocaleDateString('en-US', options)
}

export const formatDateForInput = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  return dateObj.toISOString().slice(0, 16)
}

export const isDateInPast = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

export const isDateInFuture = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj > new Date()
}

export const getTimeUntilDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = dateObj.getTime() - now.getTime()
  
  if (diff < 0) {
    return 'Past'
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// ============= Validation Utilities =============
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email) && 
         email.length <= VALIDATION_RULES.EMAIL.MAX_LENGTH
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
  }
  
  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    errors.push(`Password must be less than ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`)
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateName = (name: string): boolean => {
  return name.length >= VALIDATION_RULES.NAME.MIN_LENGTH &&
         name.length <= VALIDATION_RULES.NAME.MAX_LENGTH &&
         VALIDATION_RULES.NAME.PATTERN.test(name)
}

export const validateRallyName = (name: string): boolean => {
  return name.length >= VALIDATION_RULES.RALLY_NAME.MIN_LENGTH &&
         name.length <= VALIDATION_RULES.RALLY_NAME.MAX_LENGTH
}

export const validateParticipantCount = (count: number): boolean => {
  return count >= VALIDATION_RULES.PARTICIPANT_COUNT.MIN &&
         count <= VALIDATION_RULES.PARTICIPANT_COUNT.MAX
}

// ============= String Utilities =============
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

export const generateId = (prefix = ''): string => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 5)
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`
}

// ============= Number Utilities =============
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const parseNumber = (value: string): number | null => {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

// ============= Array Utilities =============
export const removeDuplicates = <T>(array: T[]): T[] => {
  const seen = new Map<string, T>()
  return array.filter(item => {
    const key = typeof item === 'object' ? JSON.stringify(item) : String(item)
    if (seen.has(key)) {
      return false
    }
    seen.set(key, item)
    return true
  })
}

export const groupBy = <T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = getKey(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export const sortBy = <T>(
  array: T[],
  getter: (item: T) => string | number,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = getter(a)
    const bVal = getter(b)
    
    if (direction === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
}

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// ============= Object Utilities =============
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (obj && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
    }
  })
  return result
}

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

export const isEmpty = (value: any): boolean => {
  if (value == null) return true
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export const deepClone = <T>(obj: T): T => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  
  // Special handling for Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  // Use JSON for everything else (simple and TypeScript-friendly)
  return JSON.parse(JSON.stringify(obj)) as T
}

// ============= URL Utilities =============
export const buildUrl = (base: string, params: Record<string, any>): string => {
  const url = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

export const parseSearchParams = (searchParams: URLSearchParams): Record<string, string> => {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

// ============= Status Utilities =============
export const getRallyStatusColor = (status: RallyStatus): string => {
  const colors = {
    [RALLY_STATUS.UPCOMING]: 'blue',
    [RALLY_STATUS.REGISTRATION_OPEN]: 'green',
    [RALLY_STATUS.REGISTRATION_CLOSED]: 'yellow',
    [RALLY_STATUS.ACTIVE]: 'purple',
    [RALLY_STATUS.COMPLETED]: 'gray',
    [RALLY_STATUS.CANCELLED]: 'red'
  }
  return colors[status] || 'gray'
}

export const getUserStatusColor = (status: UserStatus): string => {
  const colors = {
    [USER_STATUS.PENDING_EMAIL]: 'yellow',
    [USER_STATUS.PENDING_APPROVAL]: 'blue',
    [USER_STATUS.APPROVED]: 'green',
    [USER_STATUS.REJECTED]: 'red'
  }
  return colors[status] || 'gray'
}

export const getStatusIcon = (status: RallyStatus | UserStatus): string => {
  const icons = {
    // Rally statuses
    [RALLY_STATUS.UPCOMING]: '📅',
    [RALLY_STATUS.REGISTRATION_OPEN]: '📝',
    [RALLY_STATUS.REGISTRATION_CLOSED]: '🔒',
    [RALLY_STATUS.ACTIVE]: '🏁',
    [RALLY_STATUS.COMPLETED]: '✅',
    [RALLY_STATUS.CANCELLED]: '❌',
    
    // User statuses
    [USER_STATUS.PENDING_EMAIL]: '📧',
    [USER_STATUS.PENDING_APPROVAL]: '⏳',
    [USER_STATUS.APPROVED]: '✅',
    [USER_STATUS.REJECTED]: '❌'
  }
  return icons[status] || '❓'
}

// ============= File Utilities =============
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  return imageExtensions.includes(getFileExtension(filename).toLowerCase())
}

// ============= Error Handling Utilities =============
export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message)
  }
  
  return ERROR_MESSAGES.SERVER_ERROR
}

export const createErrorMessage = (field: string, rule: string): string => {
  const messages: Record<string, string> = {
    required: `${field} is required`,
    email: `${field} must be a valid email address`,
    minLength: `${field} is too short`,
    maxLength: `${field} is too long`,
    pattern: `${field} format is invalid`
  }
  
  return messages[rule] || `${field} is invalid`
}

// ============= Debounce Utility =============
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// ============= Local Storage Utilities =============
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue ?? null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue ?? null
    } catch {
      return defaultValue ?? null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`Failed to save ${key} to localStorage`)
    }
  },
  
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(key)
    } catch {
      console.warn(`Failed to remove ${key} from localStorage`)
    }
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.clear()
    } catch {
      console.warn('Failed to clear localStorage')
    }
  }
}

// ============= Toast Notification Utilities =============
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title?: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Simple toast implementation (can be enhanced with a proper toast library)
export const createToast = (type: ToastType, message: string, options?: ToastOptions) => {
  console.log(`${type.toUpperCase()}: ${message}`, options)
}

// ============= Form Utilities =============
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item))
        })
      } else {
        formData.append(key, String(value))
      }
    }
  })
  
  return formData
}

// ============= Copy to Clipboard =============
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    } catch {
      document.body.removeChild(textArea)
      return false
    }
  }
}