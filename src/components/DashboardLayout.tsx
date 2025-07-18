// src/components/DashboardLayout.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
'use client'

import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { useView } from './ViewProvider'
import { BurgerMenu } from './navigation/BurgerMenu'
import '@/styles/futuristic-theme.css'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { currentView, setCurrentView, canSwitchView } = useView()

  const handleLogout = async () => {
    console.log('🚪 Dashboard logout initiated...')
    
    try {
      await logout()
      
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
        window.sessionStorage.clear()
        window.localStorage.removeItem('supabase.auth.token')
        window.localStorage.removeItem('sb-localhost-auth-token')
        window.localStorage.removeItem('sb-' + window.location.hostname + '-auth-token')
      }
      
      console.log('✅ Dashboard logout completed, redirecting to main page...')
      
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Dashboard logout error:', error)
      window.location.href = '/'
    }
  }

  const handleViewSwitch = (view: 'admin' | 'user') => {
    if (view === 'admin') {
      window.location.href = '/admin-dashboard'
    } else {
      window.location.href = '/user-dashboard'
    }
  }

  const getCurrentView = () => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      
      const adminPages = [
        '/admin-dashboard',
        '/user-management', 
        '/game-management',
        '/rally-management',
        '/news-management',
        '/championships',
        '/results',
        '/participant-linking',
        '/sponsors',
        '/teams-manager',
        '/generate-rally',
        '/product-dashboard'
      ]
      
      if (adminPages.some(page => pathname.includes(page))) {
        return 'admin'
      } else {
        return 'user'
      }
    }
    return 'user'
  }

  const actualCurrentView = getCurrentView()

  if (!user) return null

  return (
    <div className="min-h-screen bg-black">
      {/* Futuristic Navigation Header */}
      <nav className="sticky top-0 z-30">
        {/* Animated tech border effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-transparent backdrop-blur-2xl"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
        
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-20 py-6">
              {/* Left Section: Logo - Futuristic Style */}
              <div className="flex items-center space-x-4">
                <a 
                  href="/"
                  className="flex items-center space-x-4 group"
                >
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,0,64,0.3)] ring-2 ring-red-500/20 bg-gradient-to-br from-red-900/20 to-gray-900/20 backdrop-blur-sm p-1 group-hover:ring-red-500/40 transition-all duration-300">
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
                    <h1 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider group-hover:text-red-400 transition-colors">
                      LegendRix
                    </h1>
                    <p className="text-sm text-red-400/80 font-medium -mt-1 font-['Orbitron'] uppercase tracking-wide">
                      E-Spordikeskus
                    </p>
                  </div>
                </a>
              </div>
              
              {/* Right Section: View Switcher + Burger Menu */}
              <div className="flex items-center space-x-4">
                {/* View Switcher for Admins - Futuristic Design */}
                {canSwitchView && (
                  <div className="hidden md:flex bg-gray-900/50 rounded-xl p-1 backdrop-blur-sm border border-gray-800">
                    <button
                      onClick={() => handleViewSwitch('user')}
                      className={`px-4 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
                        actualCurrentView === 'user'
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(255,0,64,0.5)]'
                          : 'text-gray-400 hover:text-red-400 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>🏁</span>
                        <span>Võistleja</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleViewSwitch('admin')}
                      className={`px-4 py-2 rounded-lg text-sm font-['Orbitron'] uppercase tracking-wider transition-all duration-300 ${
                        actualCurrentView === 'admin'
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(255,0,64,0.5)]'
                          : 'text-gray-400 hover:text-red-400 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>👑</span>
                        <span>Admin</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Mobile View Switcher */}
                {canSwitchView && (
                  <div className="md:hidden">
                    <button
                      onClick={() => handleViewSwitch(actualCurrentView === 'admin' ? 'user' : 'admin')}
                      className="p-2 bg-gray-900/50 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm border border-gray-800"
                    >
                      {actualCurrentView === 'admin' ? '🏁' : '👑'}
                    </button>
                  </div>
                )}

                {/* Burger Menu with Futuristic Style */}
                <BurgerMenu user={user} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Grid Pattern Background */}
      <main className="relative">
        {/* Futuristic grid background */}
        <div className="fixed inset-0 grid-pattern opacity-5 pointer-events-none"></div>
        
        {/* Gradient orbs for ambiance */}
        <div className="fixed top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="fixed bottom-20 right-20 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}