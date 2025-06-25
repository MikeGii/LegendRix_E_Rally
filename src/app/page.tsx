// src/app/page.tsx - Updated with Toast notifications for authentication errors
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { VerificationMessage } from '@/components/auth/VerificationMessage'
import { CompetitionsModal } from '@/components/landing/CompetitionsModal'
import { EdetabelModal } from '@/components/landing/EdetabelModal'
import { usePublicUpcomingRallies } from '@/hooks/usePublicRallies'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { ToastProvider, useToast } from '@/components/ui/Toast'

// Import modular landing page components
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { SupportersSection } from '@/components/landing/supporters/SupportersSection'
import { SocialMediaSection } from '@/components/landing/sections/SocialMediaSection'

type AuthView = 'login' | 'register' | 'forgot-password'

// Memoized modal state calculations
const useModalState = (
  isCompetitionsModalOpen: boolean,
  isEdetabelModalOpen: boolean,
  showAuthModal: boolean,
  isChampionshipModalOpen: boolean
) => {
  return useMemo(
    () => isCompetitionsModalOpen || isEdetabelModalOpen || showAuthModal || isChampionshipModalOpen,
    [isCompetitionsModalOpen, isEdetabelModalOpen, showAuthModal, isChampionshipModalOpen]
  )
}

function HomeContent() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const { showAuthError, showToast } = useToast()
  const [authView, setAuthView] = useState<AuthView>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isCompetitionsModalOpen, setIsCompetitionsModalOpen] = useState(false)
  const [isEdetabelModalOpen, setIsEdetabelModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isChampionshipModalOpen, setIsChampionshipModalOpen] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  // ADDED: Track login state to prevent premature modal closing
  const [wasLoggedIn, setWasLoggedIn] = useState(false)

  // Optimized modal state calculation
  const isAnyModalOpen = useModalState(
    isCompetitionsModalOpen,
    isEdetabelModalOpen,
    showAuthModal,
    isChampionshipModalOpen
  )

  // Load upcoming rallies for competitions modal - only when needed
  const { data: upcomingRallies = [], isLoading: isLoadingRallies } = usePublicUpcomingRallies(10)

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // UPDATED: Only close modal when user actually becomes logged in (not on failed attempts)
  useEffect(() => {
    // Only act when user state actually changes from null to user (successful login)
    if (user && !wasLoggedIn && showAuthModal) {
      setShowAuthModal(false)
      setAuthView('login')
      setAttemptCount(0)
      
      // Show success toast
      showToast({
        type: 'success',
        message: `Tere tulemast, ${user.name}! Oled edukalt sisse logitud.`,
        duration: 4000
      })
      
      setWasLoggedIn(true)
    } else if (!user && wasLoggedIn) {
      // User logged out
      setWasLoggedIn(false)
    } else if (user && !wasLoggedIn) {
      // User was already logged in on page load
      setWasLoggedIn(true)
    }
  }, [user, wasLoggedIn, showAuthModal, showToast])

  // Memoized event handlers to prevent unnecessary re-renders
  const handleOpenAuth = useCallback(() => {
    setShowAuthModal(true)
    setAttemptCount(0) // Reset attempt count when opening modal
  }, [])

  const handleCloseAuth = useCallback(() => {
    setShowAuthModal(false)
    setAuthView('login') // Reset to login when closing
    setAttemptCount(0) // Reset attempt count
  }, [])

  // UPDATED: Don't close modal here, let useEffect handle it when user state changes
  const handleLoginSuccess = useCallback(() => {
    // Modal will be closed by the useEffect when user changes
    // Success toast will also be shown there
  }, [])

  const handleLoginError = useCallback((error: string) => {
    const currentAttempt = attemptCount + 1
    setAttemptCount(currentAttempt)
    
    // Show error as toast notification on screen instead of in modal
    showAuthError(error, currentAttempt, () => {
      setAuthView('forgot-password')
    })
  }, [attemptCount, showAuthError])

  const handleRegisterSuccess = useCallback((message: string) => {
    showToast({
      type: 'success',
      message,
      duration: 6000
    })
    setAuthView('login') // Switch to login after successful registration
  }, [showToast])

  const handleRegisterError = useCallback((error: string) => {
    showToast({
      type: 'error',
      message: error,
      duration: 5000
    })
  }, [showToast])

  const handleDashboard = useCallback(() => {
    if (user) {
      router.push('/user-dashboard')
    }
  }, [user, router])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    
    try {
      await logout()
      
      showToast({
        type: 'info',
        message: 'Oled edukalt välja logitud.',
        duration: 3000
      })
      
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      showToast({
        type: 'error',
        message: 'Väljalogimisel tekkis viga. Proovime uuesti...',
        duration: 3000
      })
      window.location.href = '/'
    }
  }, [logout, showToast])

  const handleOpenCompetitions = useCallback(() => {
    setIsCompetitionsModalOpen(true)
  }, [])

  const handleOpenEdetabel = useCallback(() => {
    setIsEdetabelModalOpen(true)
  }, [])

  // Simple loading state to prevent hydration issues
  if (!isMounted) {
    return null
  }

  // Memoized blur classes for performance
  const blurClasses = isAnyModalOpen 
    ? 'pointer-events-none opacity-75 blur-sm transition-all duration-300' 
    : ''

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 z-30 ${blurClasses}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/80 to-transparent backdrop-blur-2xl border-b border-white/5 shadow-2xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-1">
                <div className="w-full h-full rounded-xl overflow-hidden relative">
                  <Image
                    src="/image/rally-cover.png"
                    alt="LegendRix Rally"
                    fill
                    className="object-cover"
                    priority
                    sizes="56px"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-xl tracking-wide">LegendRix</h1>
                <p className="text-sm text-blue-300/90 drop-shadow-lg font-medium -mt-1">E-Spordikeskus</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <button
                    onClick={handleDashboard}
                    className="group px-6 py-3 bg-gradient-to-r from-blue-600/20 to-blue-500/10 hover:from-blue-600/40 hover:to-blue-500/30 backdrop-blur-xl text-white rounded-2xl font-semibold transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40 shadow-xl hover:shadow-blue-500/20 hover:scale-105"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">🏠</span>
                      <span>Töölaud</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="group px-6 py-3 bg-gradient-to-r from-red-600/20 to-red-500/10 hover:from-red-600/40 hover:to-red-500/30 backdrop-blur-xl text-white rounded-2xl font-semibold transition-all duration-300 border border-red-500/20 hover:border-red-400/40 shadow-xl hover:shadow-red-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        {isLoggingOut ? '⏳' : '🚪'}
                      </span>
                      <span>{isLoggingOut ? 'Välja logimas...' : 'Logi Välja'}</span>
                    </div>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenAuth}
                  className="group px-8 py-3 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/15 text-white rounded-2xl font-semibold transition-all duration-300 border border-white/15 hover:border-white/30 shadow-xl hover:shadow-white/10 hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">👤</span>
                    <span>Logi sisse / Registreeru</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cover Photo */}
      <div className={`relative w-full ${blurClasses}`} style={{ height: '35vh', marginTop: '100px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/cover-photo.png"
            alt="LegendRix E-Rally Cover"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 60%' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/20 to-slate-950/90"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className={`relative z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 ${blurClasses}`}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          {user && (
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-xl">
                Tere tulemast, {user.name}!
              </h3>
              <p className="text-xl text-slate-300 drop-shadow-lg">
                Valmis uuteks väljakutseteks? Vaadake meie uusimaid võistlusi ja alustage oma rallikarjääri!
              </p>
            </div>
          )}

          <HeroSection 
            user={user}
            onOpenAuth={handleOpenAuth}
            onDashboard={handleDashboard}
          />

          <FeaturesSection
            onOpenCompetitions={handleOpenCompetitions}
            showDynamicData={true}
            showEdetabelModal={true}
          />

          <SupportersSection />
          <SocialMediaSection />
        </div>
      </main>

      {/* CLEAN AUTH MODAL - No error display inside, errors shown as toasts */}
      {!user && showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleCloseAuth}
          ></div>
          
          <div className="relative w-full max-w-md animate-fadeIn">
            <div className="glass-panel rounded-xl p-8 shadow-2xl relative">
              <button
                onClick={handleCloseAuth}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
              >
                ✕
              </button>

              <div className="flex justify-center mb-8 animate-float">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-2 border-blue-500/30 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src="/image/rally-cover.png"
                      alt="LegendRix Rally"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              <VerificationMessage />

              <h2 className="text-center text-2xl font-bold text-white mb-6">
                {authView === 'login' ? 'Tere tulemast tagasi' : 
                 authView === 'register' ? 'Loo uus konto' : 'Parooli taastamine'}
              </h2>

              {authView === 'login' ? (
                <LoginForm 
                  onSwitchToRegister={() => setAuthView('register')}
                  onSwitchToForgotPassword={() => setAuthView('forgot-password')}

                  onLoginSuccess={handleLoginSuccess}
                />
              ) : authView === 'register' ? (
                <RegisterForm 
                  onSwitchToLogin={() => setAuthView('login')}
                  onSuccess={handleRegisterSuccess}
                  onError={handleRegisterError}
                />
              ) : (
                <ForgotPasswordForm onBackToLogin={() => setAuthView('login')} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}
      <CompetitionsModal
        isOpen={isCompetitionsModalOpen}
        onClose={() => setIsCompetitionsModalOpen(false)}
        rallies={upcomingRallies}
        isLoading={isLoadingRallies}
      />

      <EdetabelModal
        isOpen={isEdetabelModalOpen}
        onClose={() => setIsEdetabelModalOpen(false)}
        onChampionshipModalToggle={setIsChampionshipModalOpen}
      />
    </div>
  )
}

// Main component wrapped with ToastProvider
export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  )
}