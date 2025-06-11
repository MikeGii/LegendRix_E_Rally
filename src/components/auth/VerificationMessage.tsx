'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function VerificationMessage() {
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for verification success
    if (searchParams.get('verified') === 'true') {
      setVerificationMessage('Email verified successfully! You can now sign in.')
      
      // Clear the URL parameter after 5 seconds
      setTimeout(() => {
        setVerificationMessage(null)
        window.history.replaceState({}, '', '/')
      }, 5000)
    }

    // Check for auth errors
    if (searchParams.get('error') === 'auth_error') {
      setVerificationMessage('There was an error with email verification. Please try again.')
      
      // Clear the URL parameter after 5 seconds
      setTimeout(() => {
        setVerificationMessage(null)
        window.history.replaceState({}, '', '/')
      }, 5000)
    }
  }, [searchParams])

  if (!verificationMessage) return null

  return (
    <div className="mb-6 p-4 rounded-lg border bg-green-900/50 border-green-700 text-green-300">
      <div className="flex items-center space-x-3">
        <span className="text-lg">✅</span>
        <p className="font-medium">{verificationMessage}</p>
      </div>
    </div>
  )
}