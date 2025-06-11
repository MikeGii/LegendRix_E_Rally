'use client'

import { useState, Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { VerificationMessage } from '@/components/auth/VerificationMessage'

type AuthView = 'login' | 'register'

function HomeContent() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-panel rounded-xl p-8 shadow-2xl">
          {/* Animated Logo */}
          <div className="flex justify-center mb-8 animate-float">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>

          {/* Verification Message - wrapped in Suspense */}
          <Suspense fallback={null}>
            <VerificationMessage />
          </Suspense>

          {/* Form Title */}
          <h2 className="text-center text-2xl font-bold text-white mb-6">
            {authView === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>

          {authView === 'login' ? (
            <LoginForm 
              onSwitchToRegister={() => setAuthView('register')}
              onLoginStart={() => setIsLoggingIn(true)}
              onLoginError={() => setIsLoggingIn(false)}
            />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}