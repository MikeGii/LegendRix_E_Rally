// src/components/shared/Modal.tsx - Universal Modal Components
import { ReactNode } from 'react'
import { Button } from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantConfig = {
    danger: {
      icon: '⚠️',
      confirmVariant: 'danger' as const,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    warning: {
      icon: '⚠️',
      confirmVariant: 'primary' as const,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    info: {
      icon: 'ℹ️',
      confirmVariant: 'primary' as const,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    }
  }

  const config = variantConfig[variant]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
              <span className="text-2xl">{config.icon}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-slate-300">{message}</p>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                  size="sm"
                >
                  {cancelText}
                </Button>
                <Button
                  variant={config.confirmVariant}
                  onClick={onConfirm}
                  loading={loading}
                  size="sm"
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function InfoModal({ isOpen, onClose, title, children, maxWidth = 'md' }: InfoModalProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />
        
        <div className={`inline-block w-full ${maxWidthClasses[maxWidth]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          
          <div className="text-slate-300">
            {children}
          </div>
          
          <div className="flex justify-end pt-6 border-t border-slate-700 mt-6">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}