// src/lib/validation.ts - Universal Validation Utilities
import { GAME_CONSTANTS } from './constants'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface ValidationRule<T = any> {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: T) => string | undefined
}

export function validateField(value: any, rules: ValidationRule): string | undefined {
  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required'
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return undefined
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format'
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `Must be at least ${rules.min}`
    }
    
    if (rules.max !== undefined && value > rules.max) {
      return `Must be no more than ${rules.max}`
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value)
  }

  return undefined
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules)
    if (error) {
      errors[field] = error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Specific validation functions for game management
export const gameValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  developer: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  platform: {
    required: true,
    custom: (value: string) => {
      if (!GAME_CONSTANTS.PLATFORMS.includes(value as any)) {
        return 'Please select a valid platform'
      }
    }
  },
  release_year: {
    required: true,
    min: GAME_CONSTANTS.MIN_YEAR,
    max: GAME_CONSTANTS.MAX_YEAR
  },
  description: {
    maxLength: 500
  }
}

export const gameTypeValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  min_participants: {
    required: true,
    min: GAME_CONSTANTS.MIN_PARTICIPANTS,
    max: GAME_CONSTANTS.MAX_PARTICIPANTS
  },
  max_participants: {
    min: 1,
    max: GAME_CONSTANTS.MAX_PARTICIPANTS,
    custom: (value: number, data: any) => {
      if (value && data.min_participants && value < data.min_participants) {
        return 'Maximum must be greater than minimum participants'
      }
    }
  },
  duration_minutes: {
    min: 1,
    max: 1440 // 24 hours
  },
  description: {
    maxLength: 500
  }
}

export const gameEventValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  event_date: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value)
      const now = new Date()
      if (date <= now) {
        return 'Event date must be in the future'
      }
    }
  },
  registration_deadline: {
    required: true,
    custom: (value: string, data: any) => {
      const deadline = new Date(value)
      const eventDate = new Date(data.event_date)
      const now = new Date()
      
      if (deadline <= now) {
        return 'Registration deadline must be in the future'
      }
      
      if (deadline >= eventDate) {
        return 'Registration deadline must be before the event date'
      }
    }
  },
  max_participants: {
    min: 1,
    max: GAME_CONSTANTS.MAX_PARTICIPANTS
  },
  description: {
    maxLength: 500
  }
}

export const gameClassValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  skill_level: {
    required: true,
    custom: (value: string) => {
      const validLevels = GAME_CONSTANTS.SKILL_LEVELS.map(level => level.value)
      if (!validLevels.includes(value as any)) {
        return 'Please select a valid skill level'
      }
    }
  },
  car_requirements: {
    maxLength: 200
  },
  description: {
    maxLength: 500
  }
}