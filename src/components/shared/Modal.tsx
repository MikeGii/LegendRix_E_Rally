// src/components/shared/Modal.tsx - Universal Modal Components
import { ReactNode } from 'react'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string | ReactNode
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function FormModal({ isOpen, onClose, title, children, maxWidth = 'md' }: FormModalProps) {
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
            <div className="text-xl font-semibold text-white">{title}</div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'red' | 'blue' | 'green'
  isLoading?: boolean
  icon?: string  // Add missing icon prop
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
  icon = '⚠️'  // Default icon
}: ConfirmModalProps) {
  if (!isOpen) return null

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75"
          onClick={onClose}
        />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <span className="text-2xl">{icon}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-slate-300">{message}</p>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 py-2 ${colorClasses[confirmColor]} disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
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
      </div>
    </div>
  )
}