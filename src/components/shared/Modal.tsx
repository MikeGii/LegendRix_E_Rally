// src/components/shared/Modal.tsx - Fixed version

import { ReactNode } from 'react'
import type { ModalProps } from '@/types'

interface BaseModalProps extends ModalProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
}

export function BaseModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'md',
  showCloseButton = true 
}: BaseModalProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      <div className={`relative bg-slate-800 rounded-2xl border border-slate-700 w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden animate-fadeIn`}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {showCloseButton && (
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// ============= Confirmation Modal =============
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  confirmColor?: 'red' | 'green' | 'blue' | 'purple'
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
  confirmColor = 'blue',
  isLoading = false,
  icon
}: ConfirmModalProps) {
  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700 disabled:bg-red-800 hover:shadow-red-500/25',
    green: 'bg-green-600 hover:bg-green-700 disabled:bg-green-800 hover:shadow-green-500/25',
    blue: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 hover:shadow-blue-500/25',
    purple: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 hover:shadow-purple-500/25'
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={false}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        
        <p className="text-slate-300 mb-6">{message}</p>
        
        <div className="flex space-x-4">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 shadow-lg disabled:opacity-50 ${colorClasses[confirmColor]}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </BaseModal>
  )
}

// ============= Form Modal =============
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function FormModal({ isOpen, onClose, title, children, maxWidth = 'md' }: FormModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      <div className="p-6">
        {children}
      </div>
    </BaseModal>
  )
}

// ============= Loading Modal =============
interface LoadingModalProps {
  isOpen: boolean
  message?: string
}

export function LoadingModal({ isOpen, message = 'Loading...' }: LoadingModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={() => {}} showCloseButton={false} maxWidth="sm">
      <div className="p-8 text-center">
        <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">{message}</p>
      </div>
    </BaseModal>
  )
}