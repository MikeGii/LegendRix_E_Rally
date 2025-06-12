// src/lib/statusUtils.ts - Centralized status management

import type { StatusMessage, User } from '@/types'

// ============= Status Color Mappings =============
export const getStatusColor = (status: string, type: 'rally' | 'user' | 'registration' | 'payment' = 'rally') => {
  const colorMap: Record<string, Record<string, string>> = {
    rally: {
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      registration_open: 'bg-green-500/20 text-green-400 border-green-500/30',
      registration_closed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      active: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    user: {
      pending_email: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      pending_approval: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    registration: {
      open: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      full: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    },
    payment: {
      paid: 'text-green-400',
      pending: 'text-yellow-400',
      refunded: 'text-red-400',
      waived: 'text-blue-400',
    }
  }

  return colorMap[type]?.[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

// ============= Status Messages =============
export const getUserStatusMessage = (user: User, isAdminAsUser: boolean = false): StatusMessage => {
  if (isAdminAsUser) {
    return {
      type: 'success',
      message: 'Administrator access - all rally features unlocked',
      icon: '👑',
      color: 'green'
    }
  }

  if (!user.email_verified) {
    return {
      type: 'warning',
      message: 'Please verify your email to access rally features',
      icon: '📧',
      color: 'yellow'
    }
  }
  
  if (!user.admin_approved) {
    return {
      type: 'info',
      message: 'Account pending approval - you will be notified when ready',
      icon: '⏳',
      color: 'blue'
    }
  }
  
  return {
    type: 'success',
    message: 'Account verified - ready to compete in rallies!',
    icon: '✅',
    color: 'green'
  }
}

// ============= Time Formatting =============
export const formatDaysUntil = (days: number): string => {
  if (days < 0) return 'Past event'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `${days} days`
  if (days < 30) return `${Math.ceil(days / 7)} weeks`
  return `${Math.ceil(days / 30)} months`
}

export const formatDateTime = (dateString: string, options: {
  includeTime?: boolean
  short?: boolean
} = {}) => {
  const date = new Date(dateString)
  
  if (options.short) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(options.includeTime && { hour: '2-digit', minute: '2-digit' })
    })
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(options.includeTime && { hour: '2-digit', minute: '2-digit' })
  })
}

// ============= Role and Permission Checks =============
export const canUserAccess = (user: User | null, requiredPermissions: string[] = []): boolean => {
  if (!user) return false
  
  // Admin bypass
  if (user.role === 'admin') return true
  
  // Basic access requires email verification and admin approval
  const hasBasicAccess = user.email_verified && user.admin_approved && user.status === 'approved'
  
  if (requiredPermissions.length === 0) return hasBasicAccess
  
  // Add specific permission checks here as needed
  return hasBasicAccess
}

export const canUserRegister = (user: User | null): boolean => {
  return canUserAccess(user) || (user?.role === 'admin')
}

// ============= Badge Components =============
export const getBadgeProps = (type: 'role' | 'status' | 'featured', value: string) => {
  const badges: Record<string, Record<string, { text: string; className: string }>> = {
    role: {
      admin: { text: '👑 Admin', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      user: { text: '👤 User', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    },
    status: {
      featured: { text: '⭐ FEATURED', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      registered: { text: '✅ REGISTERED', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    },
    featured: {
      true: { text: '⭐ Featured', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      false: { text: '', className: '' }
    }
  }

  return badges[type]?.[value] || { text: value, className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' }
}

// ============= Progress Calculation =============
export const calculateProgress = (current: number, max: number): number => {
  if (!max || max === 0) return 0
  return Math.min(100, (current / max) * 100)
}

export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-blue-500'
}

// ============= Currency Formatting =============
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ============= Validation Helpers =============
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

export const validateRegistrationForm = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters')
  }
  
  if (!isValidEmail(data.email)) {
    errors.push('Invalid email address')
  }
  
  if (!isValidPassword(data.password)) {
    errors.push('Password must be at least 6 characters')
  }
  
  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  if (!data.agreeToRules) {
    errors.push('You must agree to the rules')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}