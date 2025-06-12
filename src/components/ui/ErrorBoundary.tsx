// src/components/ui/ErrorBoundary.tsx - Fixed imports and types
'use client'

import React, { Component, ErrorInfo } from 'react'

// Simple icon components to avoid external dependencies
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <circle cx="12" cy="17" r="1"/>
  </svg>
)

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
)

const Home = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)

const Bug = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m8 2 1.88 1.88"/>
    <path d="M14.12 3.88 16 2"/>
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
    <path d="M12 20v-9"/>
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5"/>
    <path d="M6 13H2"/>
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/>
    <path d="M22 13h-4"/>
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
  </svg>
)

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to log to an error reporting service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportBug = () => {
    const { error, errorInfo } = this.state
    const errorReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please share it with the development team.')
      })
      .catch(() => {
        alert('Failed to copy error report. Please take a screenshot and report manually.')
      })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-slate-400 mb-6">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {/* Error Details (Development only) */}
            {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
              <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600 text-left">
                <h3 className="text-sm font-medium text-red-400 mb-2">Error Details:</h3>
                <p className="text-xs text-slate-300 font-mono break-all mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <details className="text-xs text-slate-400">
                    <summary className="cursor-pointer hover:text-slate-300">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>

                <button
                  onClick={this.handleReportBug}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Bug className="w-4 h-4" />
                  <span>Report</span>
                </button>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-xs text-slate-500 mt-4">
              If this problem persists, please contact support or try refreshing the page.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
import { useState, useEffect } from 'react'

interface UseErrorBoundaryResult {
  hasError: boolean
  error: Error | null
  resetError: () => void
  captureError: (error: Error) => void
}

export const useErrorBoundary = (): UseErrorBoundaryResult => {
  const [error, setError] = useState<Error | null>(null)

  const resetError = () => setError(null)
  const captureError = (error: Error) => setError(error)

  // Reset error when component unmounts
  useEffect(() => {
    return () => setError(null)
  }, [])

  return {
    hasError: !!error,
    error,
    resetError,
    captureError
  }
}

// Async error boundary for handling promise rejections
export const AsyncErrorBoundary: React.FC<{
  children: React.ReactNode
  onError?: (error: Error) => void
}> = ({ children, onError }) => {
  const { captureError } = useErrorBoundary()

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      captureError(error)
      onError?.(error)
      event.preventDefault()
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  }, [captureError, onError])

  return <>{children}</>
}

// Specific error boundary for forms
export const FormErrorBoundary: React.FC<{
  children: React.ReactNode
  onError?: (error: Error) => void
}> = ({ children, onError }) => {
  return (
    <ErrorBoundary
      onError={onError}
      fallback={
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Form Error</h3>
              <p className="text-sm text-red-700 mt-1">
                There was an error with the form. Please refresh the page and try again.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Error boundary for data loading
export const DataErrorBoundary: React.FC<{
  children: React.ReactNode
  onRetry?: () => void
}> = ({ children, onRetry }) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Failed to load data
            </h3>
            <p className="text-slate-600 mb-4">
              There was an error loading the data. Please try again.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default ErrorBoundary