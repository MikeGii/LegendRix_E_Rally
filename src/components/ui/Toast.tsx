// src/components/ui/Toast.tsx - Toast notification system for screen-level errors
'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { formatAuthErrorForDisplay } from '@/utils/authErrors'

interface ToastData {
  id: string
  message: string
  type: 'error' | 'success' | 'warning' | 'info'
  duration?: number
  help?: string[]
  showForgotPassword?: boolean
  onForgotPassword?: () => void
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void
  showAuthError: (error: string, attemptCount?: number, onForgotPassword?: () => void) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration || 6000
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const showAuthError = (error: string, attemptCount: number = 0, onForgotPassword?: () => void) => {
    const errorDetails = formatAuthErrorForDisplay(error, attemptCount, true)
    
    showToast({
      type: 'error',
      message: errorDetails.message,
      help: errorDetails.help,
      showForgotPassword: errorDetails.showForgotPassword,
      onForgotPassword,
      duration: errorDetails.showForgotPassword ? 8000 : 6000 // Longer for forgot password option
    })
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, showAuthError, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container Component
function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: ToastData[]
  onRemove: (id: string) => void 
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Individual Toast Component
function ToastItem({ 
  toast, 
  onRemove 
}: { 
  toast: ToastData
  onRemove: (id: string) => void 
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // Animation timing
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10) // Entry animation
  }, [])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300) // Exit animation duration
  }

  const getToastStyles = () => {
    const baseStyles = "relative p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform"
    
    const visibilityStyles = isVisible && !isExiting
      ? "translate-x-0 opacity-100 scale-100"
      : "translate-x-full opacity-0 scale-95"

    const typeStyles = {
      error: "bg-red-900/90 border-red-700/50 text-red-100",
      success: "bg-green-900/90 border-green-700/50 text-green-100",
      warning: "bg-yellow-900/90 border-yellow-700/50 text-yellow-100",
      info: "bg-blue-900/90 border-blue-700/50 text-blue-100"
    }

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type]}`
  }

  const getIcon = () => {
    const icons = {
      error: "❌",
      success: "✅", 
      warning: "⚠️",
      info: "ℹ️"
    }
    return icons[toast.type]
  }

  return (
    <div className={getToastStyles()}>
      {/* Close button */}
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        <span className="text-xs opacity-70">✕</span>
      </button>

      {/* Main content */}
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0 mt-0.5">{getIcon()}</span>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-relaxed">{toast.message}</p>
          
          {/* Forgot Password suggestion */}
          {toast.showForgotPassword && toast.onForgotPassword && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs opacity-80">
                Kas unustasid parooli?{' '}
                <button
                  onClick={() => {
                    toast.onForgotPassword?.()
                    handleRemove()
                  }}
                  className="underline hover:no-underline font-medium"
                >
                  Taasta parool siin
                </button>
              </p>
            </div>
          )}
          
          {/* Help tips */}
          {toast.help && toast.help.length > 0 && (
            <div className="mt-3 pt-2 border-t border-current/20">
              <p className="text-xs opacity-80 mb-2">💡 Abiks:</p>
              <ul className="text-xs opacity-75 space-y-1">
                {toast.help.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="mt-0.5 opacity-60">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}