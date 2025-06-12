// src/components/shared/States.tsx - Reusable state components
import { ReactNode } from 'react'

// ============= Loading States =============
interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className={`border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin ${sizeClasses[size]} mb-4`}></div>
      <p className="text-slate-400">{message}</p>
    </div>
  )
}

// ============= Error States =============
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  icon?: string
  className?: string
}

export function ErrorState({ 
  title = 'Error',
  message, 
  onRetry,
  icon = '❌',
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl text-red-400">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

// ============= Empty States =============
interface EmptyStateProps {
  title: string
  message: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  title, 
  message, 
  icon = '📄',
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="w-24 h-24 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl text-slate-500">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{message}</p>
      {action && (
        <button 
          onClick={action.onClick}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ============= Selection States =============
interface SelectionRequiredProps {
  title: string
  message: string
  icon?: string
  className?: string
}

export function SelectionRequired({ 
  title, 
  message, 
  icon = '⚠️',
  className = ''
}: SelectionRequiredProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl text-yellow-400">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{message}</p>
    </div>
  )
}

// ============= Success States =============
interface SuccessStateProps {
  title: string
  message?: string
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function SuccessState({ 
  title, 
  message, 
  icon = '✅',
  action,
  className = ''
}: SuccessStateProps) {
  return (
    <div className={`text-center py-16 ${className}`}>
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl text-green-400">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {message && <p className="text-slate-400 mb-6">{message}</p>}
      {action && (
        <button 
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ============= Card Wrapper for Consistent Layout =============
interface StateCardProps {
  children: ReactNode
  className?: string
}

export function StateCard({ children, className = '' }: StateCardProps) {
  return (
    <div className={`bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 ${className}`}>
      {children}
    </div>
  )
}

// ============= Skeleton Loaders =============
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="w-12 h-12 bg-slate-700/50 rounded-xl animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
            <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="w-20 h-8 bg-slate-700/50 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-700/30 p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-slate-700/50 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700/50 rounded animate-pulse"></div>
            <div className="h-3 bg-slate-700/50 rounded animate-pulse w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  )
}