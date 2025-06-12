// src/lib/validation.ts - Fixed validation utilities
import { 
  VALIDATION_RULES, 
  ERROR_MESSAGES, 
  RALLY_STATUS, 
  USER_STATUS,
  SKILL_LEVELS,
  type SkillLevel,
  type RallyStatus, 
  type UserStatus 
} from './constants'

// ============= Form Validation Types =============
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FieldValidation {
  field: string
  value: any
  rules: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message?: string
  validator?: (value: any) => boolean
}

// ============= Basic Validation Functions =============
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const validateEmail = (email: string): boolean => {
  if (!email) return false
  return VALIDATION_RULES.EMAIL.PATTERN.test(email) && 
         email.length <= VALIDATION_RULES.EMAIL.MAX_LENGTH
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = []
  
  if (!password) {
    errors.push(ERROR_MESSAGES.REQUIRED_FIELD)
    return { isValid: false, errors }
  }
  
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
  if (!name) return false
  return name.length >= VALIDATION_RULES.NAME.MIN_LENGTH &&
         name.length <= VALIDATION_RULES.NAME.MAX_LENGTH &&
         VALIDATION_RULES.NAME.PATTERN.test(name)
}

export const validateRallyName = (name: string): boolean => {
  if (!name) return false
  return name.length >= VALIDATION_RULES.RALLY_NAME.MIN_LENGTH &&
         name.length <= VALIDATION_RULES.RALLY_NAME.MAX_LENGTH
}

export const validateParticipantCount = (count: number): boolean => {
  return count >= VALIDATION_RULES.PARTICIPANT_COUNT.MIN &&
         count <= VALIDATION_RULES.PARTICIPANT_COUNT.MAX
}

// ============= Advanced Validation Functions =============
export const validateField = (field: FieldValidation): ValidationResult => {
  const errors: string[] = []
  
  for (const rule of field.rules) {
    switch (rule.type) {
      case 'required':
        if (!validateRequired(field.value)) {
          errors.push(rule.message || `${field.field} is required`)
        }
        break
        
      case 'email':
        if (field.value && !validateEmail(field.value)) {
          errors.push(rule.message || `${field.field} must be a valid email`)
        }
        break
        
      case 'minLength':
        if (field.value && field.value.length < rule.value) {
          errors.push(rule.message || `${field.field} must be at least ${rule.value} characters`)
        }
        break
        
      case 'maxLength':
        if (field.value && field.value.length > rule.value) {
          errors.push(rule.message || `${field.field} must be less than ${rule.value} characters`)
        }
        break
        
      case 'pattern':
        if (field.value && !rule.value.test(field.value)) {
          errors.push(rule.message || `${field.field} format is invalid`)
        }
        break
        
      case 'custom':
        if (rule.validator && !rule.validator(field.value)) {
          errors.push(rule.message || `${field.field} is invalid`)
        }
        break
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateForm = (fields: FieldValidation[]): ValidationResult => {
  const allErrors: string[] = []
  
  for (const field of fields) {
    const result = validateField(field)
    allErrors.push(...result.errors)
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

// ============= Rally-specific Validations =============
export const validateRallyForm = (data: {
  name: string
  game_id: string
  game_type_id: string
  competition_date: string
  registration_deadline: string
  max_participants?: string
}): ValidationResult => {
  const fields: FieldValidation[] = [
    {
      field: 'Rally Name',
      value: data.name,
      rules: [
        { type: 'required' },
        { type: 'minLength', value: VALIDATION_RULES.RALLY_NAME.MIN_LENGTH },
        { type: 'maxLength', value: VALIDATION_RULES.RALLY_NAME.MAX_LENGTH }
      ]
    },
    {
      field: 'Game',
      value: data.game_id,
      rules: [{ type: 'required' }]
    },
    {
      field: 'Game Type',
      value: data.game_type_id,
      rules: [{ type: 'required' }]
    },
    {
      field: 'Competition Date',
      value: data.competition_date,
      rules: [
        { type: 'required' },
        { 
          type: 'custom', 
          validator: (value) => new Date(value) > new Date(),
          message: 'Competition date must be in the future'
        }
      ]
    },
    {
      field: 'Registration Deadline',
      value: data.registration_deadline,
      rules: [
        { type: 'required' },
        { 
          type: 'custom', 
          validator: (value) => new Date(value) > new Date(),
          message: 'Registration deadline must be in the future'
        },
        {
          type: 'custom',
          validator: (value) => new Date(value) < new Date(data.competition_date),
          message: 'Registration deadline must be before competition date'
        }
      ]
    }
  ]
  
  if (data.max_participants) {
    fields.push({
      field: 'Max Participants',
      value: parseInt(data.max_participants),
      rules: [
        {
          type: 'custom',
          validator: (value) => validateParticipantCount(value),
          message: `Max participants must be between ${VALIDATION_RULES.PARTICIPANT_COUNT.MIN} and ${VALIDATION_RULES.PARTICIPANT_COUNT.MAX}`
        }
      ]
    })
  }
  
  return validateForm(fields)
}

// ============= User-specific Validations =============
export const validateUserRegistration = (data: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): ValidationResult => {
  const fields: FieldValidation[] = [
    {
      field: 'Name',
      value: data.name,
      rules: [
        { type: 'required' },
        { 
          type: 'custom', 
          validator: validateName,
          message: 'Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes'
        }
      ]
    },
    {
      field: 'Email',
      value: data.email,
      rules: [
        { type: 'required' },
        { type: 'email' }
      ]
    },
    {
      field: 'Password',
      value: data.password,
      rules: [{ type: 'required' }]
    },
    {
      field: 'Confirm Password',
      value: data.confirmPassword,
      rules: [
        { type: 'required' },
        {
          type: 'custom',
          validator: (value) => value === data.password,
          message: 'Passwords do not match'
        }
      ]
    }
  ]
  
  const result = validateForm(fields)
  
  // Additional password validation
  if (data.password) {
    const passwordResult = validatePassword(data.password)
    if (!passwordResult.isValid) {
      result.errors.push(...passwordResult.errors)
      result.isValid = false
    }
  }
  
  return result
}

// ============= Game Management Validations =============
export const validateGameForm = (data: {
  name: string
  platform?: string
  developer?: string
}): ValidationResult => {
  const fields: FieldValidation[] = [
    {
      field: 'Game Name',
      value: data.name,
      rules: [
        { type: 'required' },
        { type: 'minLength', value: 2 },
        { type: 'maxLength', value: 100 }
      ]
    }
  ]
  
  if (data.platform) {
    fields.push({
      field: 'Platform',
      value: data.platform,
      rules: [{ type: 'maxLength', value: 50 }]
    })
  }
  
  if (data.developer) {
    fields.push({
      field: 'Developer',
      value: data.developer,
      rules: [{ type: 'maxLength', value: 100 }]
    })
  }
  
  return validateForm(fields)
}

export const validateGameEventForm = (data: {
  name: string
  country?: string
  surface_type?: string
}): ValidationResult => {
  const fields: FieldValidation[] = [
    {
      field: 'Event Name',
      value: data.name,
      rules: [
        { type: 'required' },
        { type: 'minLength', value: 2 },
        { type: 'maxLength', value: 100 }
      ]
    }
  ]
  
  if (data.country) {
    fields.push({
      field: 'Country',
      value: data.country,
      rules: [{ type: 'maxLength', value: 50 }]
    })
  }
  
  return validateForm(fields)
}

export const validateGameClassForm = (data: {
  name: string
  skill_level?: SkillLevel
  max_participants?: number
}): ValidationResult => {
  const fields: FieldValidation[] = [
    {
      field: 'Class Name',
      value: data.name,
      rules: [
        { type: 'required' },
        { type: 'minLength', value: 2 },
        { type: 'maxLength', value: 100 }
      ]
    }
  ]
  
  if (data.skill_level) {
    fields.push({
      field: 'Skill Level',
      value: data.skill_level,
      rules: [{
        type: 'custom',
        validator: (level: SkillLevel) => Object.values(SKILL_LEVELS).includes(level),
        message: 'Invalid skill level'
      }]
    })
  }
  
  if (data.max_participants) {
    fields.push({
      field: 'Max Participants',
      value: data.max_participants,
      rules: [{
        type: 'custom',
        validator: validateParticipantCount,
        message: `Max participants must be between ${VALIDATION_RULES.PARTICIPANT_COUNT.MIN} and ${VALIDATION_RULES.PARTICIPANT_COUNT.MAX}`
      }]
    })
  }
  
  return validateForm(fields)
}

// ============= Utility Functions =============
export const getValidationErrors = (result: ValidationResult): string[] => {
  return result.errors
}

export const getFirstValidationError = (result: ValidationResult): string | null => {
  return result.errors.length > 0 ? result.errors[0] : null
}

export const formatValidationErrors = (result: ValidationResult): string => {
  return result.errors.join(', ')
}

// ============= Export validation rule builders =============
export const rules = {
  required: (message?: string): ValidationRule => ({ 
    type: 'required', 
    message 
  }),
  
  email: (message?: string): ValidationRule => ({ 
    type: 'email', 
    message 
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({ 
    type: 'minLength', 
    value: length, 
    message 
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({ 
    type: 'maxLength', 
    value: length, 
    message 
  }),
  
  pattern: (pattern: RegExp, message?: string): ValidationRule => ({ 
    type: 'pattern', 
    value: pattern, 
    message 
  }),
  
  custom: (validator: (value: any) => boolean, message?: string): ValidationRule => ({ 
    type: 'custom', 
    validator, 
    message 
  })
}