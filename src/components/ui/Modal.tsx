// src/components/ui/Modal.tsx - Single Unified Modal System
'use client'

import { useEffect, ReactNode } from 'react'

// ============================================================================
// BASE MODAL COMPONENT - Foundation for all modals
// ============================================================================
interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  closeOnBackdropClick?: boolean
}

function BaseModal({ 
  isOpen, 
  onClose, 
  children, 
  maxWidth = 'md',
  closeOnBackdropClick = true 
}: BaseModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full ${sizeClasses[maxWidth]} 
            bg-slate-800 rounded-2xl border border-slate-700/50 
            shadow-2xl transform transition-all
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STANDARD MODAL - For forms and general content (replaces FormModal)
// ============================================================================
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | ReactNode
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' // For backward compatibility
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth,
  size // For backward compatibility
}: ModalProps) {
  // Use size if maxWidth is not provided (backward compatibility)
  const finalMaxWidth = maxWidth || size || 'md'

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth={finalMaxWidth}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </BaseModal>
  )
}

// ============================================================================
// CONFIRM MODAL - For dangerous actions and confirmations
// ============================================================================
export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'red' | 'blue' | 'green' | 'purple'
  isLoading?: boolean
  icon?: string
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'red',
  isLoading = false,
  icon = '⚠️'
}: ConfirmModalProps) {
  
  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
  }

  const iconColorClasses = {
    red: 'bg-red-500/10 border-red-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    purple: 'bg-purple-500/10 border-purple-500/30'
  }

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="sm"
      closeOnBackdropClick={!isLoading}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center
            ${iconColorClasses[confirmColor]}
          `}>
            <span className="text-2xl">{icon}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`
                  flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${colorClasses[confirmColor]}
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

// ============================================================================
// ALERT MODAL - For notifications and alerts
// ============================================================================
export interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  buttonText?: string
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK'
}: AlertModalProps) {
  
  const typeConfig = {
    success: { icon: '✅', color: 'green' },
    error: { icon: '❌', color: 'red' },
    warning: { icon: '⚠️', color: 'yellow' },
    info: { icon: 'ℹ️', color: 'blue' }
  }

  const config = typeConfig[type]

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title={title}
      message={message}
      confirmText={buttonText}
      cancelText=""
      confirmColor={config.color as 'red' | 'blue' | 'green'}
      icon={config.icon}
    />
  )
}

// ============================================================================
// LOADING MODAL - For processing states
// ============================================================================
export interface LoadingModalProps {
  isOpen: boolean
  title?: string
  message?: string
}

export function LoadingModal({
  isOpen,
  title = 'Processing...',
  message = 'Please wait while we process your request.'
}: LoadingModalProps) {
  
  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={() => {}} // No close on loading modal
      maxWidth="sm"
      closeOnBackdropClick={false}
    >
      <div className="p-6">
        <div className="flex items-center space-x-4">
          {/* Spinner */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-slate-300 text-sm mt-1">{message}</p>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}

// ============================================================================
// EXPORTS - Everything you need
// ============================================================================
export default Modal

// Legacy alias for backward compatibility  
export { Modal as FormModal }