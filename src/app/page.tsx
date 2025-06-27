// src/app/page.tsx - Futuristic Black/Grey Theme inspired by Opera GX
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
import { useScrollLock } from '@/hooks/useScrollLock'
import '@/styles/futuristic-theme.css'

// Import modular landing page components
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { SupportersSection } from '@/components/landing/supporters/SupportersSection'
import { SocialMediaSection } from '@/components/landing/sections/SocialMediaSection'
import { SectionDivider } from '@/components/landing/SectionDivider'
import { Footer } from '@/components/landing/Footer'

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

import '@/styles/futuristic-theme.css'

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
  // Existing state and effect hooks remain the same
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const { data: upcomingRallies = [], isLoading: isLoadingRallies } = usePublicUpcomingRallies()

  // Use scroll lock when auth modal is open
  useScrollLock(showAuthModal)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (authLoading || !isMounted) return

    const handleErrorFromURL = () => {
      const params = new URLSearchParams(window.location.search)
      const errorType = params.get('error')
      
      if (errorType === 'not_approved') {
        showAuthError('Teie konto ootab kinnitust. Palun proovige hiljem uuesti.')
        setShowAuthModal(true)
        window.history.replaceState({}, '', '/')
      } else if (errorType === 'auth_failed') {
        showAuthError('Sisselogimine ebaõnnestus. Palun proovige uuesti.')
        setShowAuthModal(true)
        window.history.replaceState({}, '', '/')
      }
    }

    if (!user) {
      handleErrorFromURL()
    }
  }, [user, authLoading, isMounted, showAuthError])

  const isAnyModalOpen = useModalState(isCompetitionsModalOpen, isEdetabelModalOpen, showAuthModal, isChampionshipModalOpen)
  const blurClasses = isAnyModalOpen ? 'blur-md transition-all duration-300' : ''

  const handleOpenAuth = useCallback(() => {
    setAuthView('login')
    setShowAuthModal(true)
  }, [])

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
  }, [logout])

  const handleGoToDashboard = useCallback(() => {

      router.push('/user-dashboard')

  }, [user, router])

  const handleLoginSuccess = useCallback(() => {
    setShowAuthModal(false)
    showToast({ message: 'Sisselogimine õnnestus!', type: 'success' })
    router.push(user?.role === 'admin' ? '/admin-dashboard' : '/user-dashboard')
  }, [user, router, showToast])

  const handleRegisterSuccess = useCallback(() => {
    setShowAuthModal(false)
    setShowVerification(true)
  }, [])

  const handleRegisterError = useCallback((error: string) => {
    showAuthError(error)
  }, [showAuthError])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,64,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,64,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Removed gradient mesh with purple and orange orbs */}
      </div>

      {/* Navigation Header - Futuristic Style */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${blurClasses}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-b border-red-500/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-24 py-6">
            {/* Logo with futuristic styling and pulsing effect */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-500/30 bg-gradient-to-br from-red-600/20 to-purple-600/20 backdrop-blur-sm p-1 group-hover:ring-red-500/50 transition-all neon-glow">
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
              </div>
              <h1 className="text-3xl font-black text-white font-['Orbitron'] tracking-wider">
                LEGEND<span className="text-red-500">RIX</span>
              </h1>
            </div>

            {/* User Section with futuristic buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={handleGoToDashboard}
                    disabled={isLoggingOut}
                    className="tech-border group px-6 py-3 text-white rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,64,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg neon-glow">⚡</span>
                      <span className="font-['Orbitron']">TÖÖLAUD</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="tech-border group px-6 py-3 text-white rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,0,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {isLoggingOut ? '⏳' : '🚪'}
                      </span>
                      <span className="font-['Orbitron']">{isLoggingOut ? 'VÄLJUMINE...' : 'VÄLJU'}</span>
                    </div>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleOpenAuth}
                  className="tech-border group px-8 py-3 text-white rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,64,0.6)] scan-line overflow-hidden"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg neon-glow">👤</span>
                    <span className="font-['Orbitron'] uppercase tracking-wide">Logi sisse</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cover Photo with futuristic overlay */}
      <div className={`relative w-full ${blurClasses}`} style={{ height: '40vh', marginTop: '96px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/cover-photo.png"
            alt="LegendRix E-Rally Cover"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 60%' }}
            priority
          />
          {/* Futuristic overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
          
          {/* Scan lines effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent h-32 animate-scan-line"></div>
          </div>
        </div>
        
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Main Content with futuristic styling */}
      <main className={`relative z-10 bg-black ${blurClasses}`}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Sections with futuristic theme */}
          <HeroSection 
            onOpenAuth={handleOpenAuth} 
            onOpenCompetitions={() => setIsCompetitionsModalOpen(true)} 
            onOpenEdetabel={() => setIsEdetabelModalOpen(true)} 
          />
          
          <SectionDivider variant="z-pattern" />
          
          <FeaturesSection 
            onOpenCompetitions={() => setIsCompetitionsModalOpen(true)}
            onOpenEdetabel={() => setIsEdetabelModalOpen(true)}
          />
          
          <SectionDivider variant="mixed" />
          
          <SupportersSection />
          
          <SectionDivider variant="l-corners" />
          
          <SocialMediaSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Verification Message */}
      {showVerification && (
        <VerificationMessage />
      )}

      {/* Auth Modal with futuristic styling and scroll support */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowAuthModal(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md max-h-[80vh] flex">
            <div className="relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col">
              {/* Close button - positioned absolutely */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scrollable Content - includes title */}
              <div className="flex-1 overflow-y-auto px-8 py-8 custom-modal-scrollbar">
                {/* Title - now inside scrollable area */}
                <h2 className="text-2xl font-black text-white mb-6 text-center font-['Orbitron'] tracking-wide">
                  {authView === 'login' ? 'TERE TULEMAST TAGASI' : 
                  authView === 'register' ? 'LOO UUS KONTO' : 'PAROOLI TAASTAMINE'}
                </h2>

                {/* Forms */}
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
        onChampionshipModalToggle={(isOpen) => setIsChampionshipModalOpen(isOpen)}
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