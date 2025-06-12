// src/components/shared/States.tsx - Universal State Components
import { ReactNode } from 'react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message = 'Loading...', size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      <p className="text-slate-400 text-center">{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorState({ 
  title = 'Something went wrong',
  message, 
  onRetry, 
  showRetry = true 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="text-red-500 text-6xl">⚠️</div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-slate-400 max-w-md">{message}</p>
      </div>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: string
}

export function EmptyState({ title, message, action, icon = '📦' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="text-6xl">{icon}</div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-slate-400 max-w-md">{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

interface SelectionRequiredProps {
  title: string
  message: string
  icon?: string
}

export function SelectionRequired({ title, message, icon = '⚠️' }: SelectionRequiredProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="text-6xl">{icon}</div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="text-slate-400 max-w-md">{message}</p>
      </div>
    </div>
  )
}