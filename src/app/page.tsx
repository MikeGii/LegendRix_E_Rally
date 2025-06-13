'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { VerificationMessage } from '@/components/auth/VerificationMessage'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useUpcomingRallies } from '@/hooks/useOptimizedRallies'
import { CompetitionsModal } from '@/components/landing/CompetitionsModal'

type AuthView = 'login' | 'register'

function HomeContent() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isCompetitionsModalOpen, setIsCompetitionsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  // Load upcoming rallies for competitions modal
  const { data: upcomingRallies = [], isLoading: isLoadingRallies } = useUpcomingRallies(10)

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleOpenAuth = () => {
    setShowAuthModal(true)
  }

  const handleCloseAuth = () => {
    setShowAuthModal(false)
    setAuthView('login') // Reset to login when closing
  }

  const handleLoginSuccess = async () => {
    // Close the modal after successful login
    setShowAuthModal(false)
    setAuthView('login')
    
    // Wait for auth state to settle, then refresh
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('🔄 Forcing page refresh after successful login')
    window.location.reload()
  }

  const handleDashboard = () => {
    if (user) {
      const dashboardUrl = user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard'
      router.push(dashboardUrl)
    }
  }

  const handleLogout = async () => {
    console.log('🚪 Main page logout initiated...')
    
    try {
      // Clear all auth state first
      await logout()
      
      // Clear any remaining session data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        window.localStorage.clear()
        // Clear sessionStorage  
        window.sessionStorage.clear()
        // Clear any supabase specific storage
        window.localStorage.removeItem('supabase.auth.token')
        window.localStorage.removeItem('sb-localhost-auth-token')
      }
      
      console.log('✅ Logout completed, forcing page reload...')
      
      // Force a hard reload to completely reset the app state
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force reload even if logout fails
      window.location.href = '/'
    }
  }

  const handleOpenCompetitions = () => {
    setIsCompetitionsModalOpen(true)
  }

  // Simple loading state to prevent hydration issues
  if (!isMounted) {
    return null // Don't render anything on server
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      {/* Elegant Glassmorphism Header */}
      <header className="absolute top-0 left-0 right-0 z-30">
        {/* Background with gradient and blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/80 to-transparent backdrop-blur-2xl border-b border-white/5 shadow-2xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo with Rally Cover Image */}
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm p-1">
                <div className="w-full h-full rounded-xl overflow-hidden">
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
                <p className="text-sm text-blue-300/90 drop-shadow-lg font-medium -mt-1">E-Rally Championship</p>
              </div>
            </div>

            {/* Enhanced Header Buttons */}
            <div className="flex items-center space-x-3">
              {user ? (
                // Logged In Buttons: Töölaud + Logi Välja
                <>
                  <button
                    onClick={handleDashboard}
                    className="group px-8 py-3 bg-gradient-to-r from-blue-600/15 to-blue-700/15 backdrop-blur-xl hover:from-blue-600/25 hover:to-blue-700/25 text-white rounded-2xl font-semibold transition-all duration-300 border border-blue-400/20 hover:border-blue-300/40 shadow-xl hover:shadow-blue-500/20 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">📊</span>
                      <span>Töölaud</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="group px-8 py-3 bg-gradient-to-r from-red-600/15 to-red-700/15 backdrop-blur-xl hover:from-red-600/25 hover:to-red-700/25 text-white rounded-2xl font-semibold transition-all duration-300 border border-red-400/20 hover:border-red-300/40 shadow-xl hover:shadow-red-500/20 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">🚪</span>
                      <span>{loading ? 'Välja logimas...' : 'Logi Välja'}</span>
                    </div>
                  </button>
                </>
              ) : (
                // Sign In / Register Button (when not logged in)
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

      {/* Enhanced Cover Photo Section with Better Positioning and Smooth Transition */}
      <div className="relative w-full" style={{ height: '35vh', marginTop: '100px' }}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/cover-photo.png"
            alt="LegendRix E-Rally Cover"
            fill
            className="object-cover"
            style={{ objectPosition: 'center 60%' }}
            priority
          />
          {/* Enhanced gradient overlay for professional look */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-900/20 to-slate-950/90"></div>
          
          {/* Subtle noise texture for premium feel */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Smooth transition to main content */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Welcome Message for Logged In Users */}
          {user && (
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-xl">
                Tere tulemast, {user.name}!
              </h3>
            </div>
          )}

          {/* Main Title */}
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl leading-tight">
              Tere tulemast LegendRix
              <span className="block text-blue-400 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">E-Spordi keskusesse!</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 drop-shadow-lg max-w-4xl mx-auto leading-relaxed">
              Kogege virtuaalse ralli põnevust. Võistlege sõitjatega üle maailma ja tõestage oma oskusi tipptasemel e-spordi keskkonnas.
            </p>
            
            {/* Call to Action - Changes based on login status */}
            {user ? (
              <button
                onClick={handleDashboard}
                className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/20"
              >
                Ava Töölaud
              </button>
            ) : (
              <button
                onClick={handleOpenAuth}
                className="px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-sm hover:from-blue-500 hover:to-blue-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/20"
              >
                Liitu Meie Tiimiga
              </button>
            )}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Võistlused - NOW CLICKABLE */}
            <button
              onClick={handleOpenCompetitions}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-10 text-center hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-2 ring-blue-500/20 group-hover:ring-blue-400/30 transition-all duration-300">
                <span className="text-4xl">🏁</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Võistlused</h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
                Osalege regulaarsetes turniirides ja meistrivõistlustes erinevates ralli mängudes.
              </p>
            </button>

            {/* Edetabel - UPDATED FROM STATISTIKA */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-10 text-center hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-2 ring-green-500/20">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Edetabel</h3>
              <p className="text-slate-400 leading-relaxed">
                Vaadake oma positsiooni edetabelis ja jälgige parimaid sõitjaid.
              </p>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-10 text-center hover:bg-slate-800/50 hover:border-slate-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-2 ring-purple-500/20">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Auhinnad</h3>
              <p className="text-slate-400 leading-relaxed">
                Võitke põnevaid auhindu ja tunnustust oma saavutuste eest.
              </p>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="text-center">
            <div className="bg-slate-900/30 backdrop-blur-2xl border border-slate-800/40 rounded-3xl p-16 max-w-5xl mx-auto shadow-2xl">
              <h3 className="text-4xl font-bold text-white mb-6">Valmis Alustama?</h3>
              <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Liituge LegendRix kogukonnaga ja alustage oma teekonda e-spordi tippu!
              </p>
              {user ? (
                <div className="space-y-6">
                  <button
                    onClick={handleDashboard}
                    className="px-16 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/20"
                  >
                    Avage Töölaud
                  </button>
                  <p className="text-slate-500 text-sm">
                    Logged in as <span className="text-slate-300 font-medium">{user.name}</span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleOpenAuth}
                  className="px-16 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/20"
                >
                  Loo Konto
                </button>
              )}
            </div>
          </div>

          {/* Social Media Section */}
          <div className="text-center mt-16">
            <h4 className="text-2xl font-bold text-white mb-8">Jälgi meid sotsiaalmeedias</h4>
            <div className="flex justify-center items-center space-x-6">
              
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/legend_rix/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-pink-500/30 hover:border-pink-400/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-pink-500/25"
              >
                <svg className="w-8 h-8 text-pink-400 group-hover:text-pink-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* YouTube - NEW ADDITION */}
              <a 
                href="https://www.youtube.com/channel/UCXw2GddTbH5mJ-pAmhd0BRA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-500/30 hover:border-red-400/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-red-500/25"
              >
                <svg className="w-8 h-8 text-red-400 group-hover:text-red-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Twitch */}
              <a 
                href="https://www.twitch.tv/legend_rix" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/25"
              >
                <svg className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a 
                href="https://www.tiktok.com/@legend_rix" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-16 h-16 bg-gradient-to-br from-slate-600/20 to-slate-800/20 backdrop-blur-xl border border-slate-500/30 hover:border-slate-400/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-slate-500/25"
              >
                <svg className="w-8 h-8 text-slate-300 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>

                            {/* Discord */}
              <a 
                href="https://discord.gg/29pax7pXGe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/25"
              >
                <svg className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
            
            {/* Social media description */}
            <p className="text-slate-400 text-sm mt-6 max-w-2xl mx-auto">
              Jälgige meie võistlusi otseülekannetes, uusimaid uudiseid ja kulisside pilte! 
              Liituge kogukonnaga ja ärge jääge ilma põnevusest.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal with 80% Dark Overlay - Only show when not logged in and modal is open */}
      {!user && showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 80% Dark Overlay - Much Darker */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={handleCloseAuth}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md animate-fadeIn">
            <div className="glass-panel rounded-xl p-8 shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={handleCloseAuth}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
              >
                ✕
              </button>

              {/* Rally Cover Logo */}
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

              {/* Verification Message */}
              <VerificationMessage />

              {/* Form Title */}
              <h2 className="text-center text-2xl font-bold text-white mb-6">
                {authView === 'login' ? 'Tere tulemast tagasi' : 'Loo uus konto'}
              </h2>

              {authView === 'login' ? (
                <LoginForm 
                  onSwitchToRegister={() => setAuthView('register')}
                  onLoginStart={() => {}}
                  onLoginError={() => {}}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : (
                <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Competitions Modal */}
      <CompetitionsModal
        isOpen={isCompetitionsModalOpen}
        onClose={() => setIsCompetitionsModalOpen(false)}
        rallies={upcomingRallies}
        isLoading={isLoadingRallies}
      />
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}