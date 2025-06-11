'use client'

import { useState, useEffect } from 'react'

export function VerificationMessage() {
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Only access URL parameters on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Check for verification success
      if (urlParams.get('verified') === 'true') {
        setVerificationMessage('Email verified successfully! You can now sign in.')
        setIsSuccess(true)
        
        // Clear the URL parameter after 8 seconds
        setTimeout(() => {
          setVerificationMessage(null)
          window.history.replaceState({}, '', '/')
        }, 8000)
      }

      // Check for different error types
      const error = urlParams.get('error')
      if (error) {
        let errorMessage = 'There was an error with email verification. Please try again.'
        
        switch (error) {
          case 'verification_failed':
            errorMessage = 'Email verification failed. The link may be expired or invalid.'
            break
          case 'auth_error':
            errorMessage = 'Authentication error occurred. Please try signing up again.'
            break
          case 'invalid_link':
            errorMessage = 'Invalid verification link. Please request a new verification email.'
            break
          default:
            errorMessage = 'There was an error with email verification. Please try again.'
        }
        
        setVerificationMessage(errorMessage)
        setIsSuccess(false)
        
        // Clear the URL parameter after 8 seconds
        setTimeout(() => {
          setVerificationMessage(null)
          window.history.replaceState({}, '', '/')
        }, 8000)
      }
    }
  }, [])

  // Don't render anything until mounted to prevent hydration issues
  if (!isMounted || !verificationMessage) return null

  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      isSuccess 
        ? 'bg-green-900/50 border-green-700 text-green-300'
        : 'bg-red-900/50 border-red-700 text-red-300'
    }`}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">
          {isSuccess ? '✅' : '❌'}
        </span>
        <p className="font-medium">{verificationMessage}</p>
      </div>
    </div>
  )
}