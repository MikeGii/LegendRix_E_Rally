// src/app/pending-approval/page.tsx
'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function PendingApprovalPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is approved, redirect to appropriate dashboard
    if (!loading && user) {
      if (user.status === 'approved' || user.role === 'admin') {
        router.replace(user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard')
      }
    }
    // If no user, redirect to login
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Laadimine...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,64,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,64,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-[0_0_40px_rgba(255,0,64,0.3)] p-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20 border-2 border-red-500/30 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-sm">
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

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-5xl">⏳</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white text-center mb-4 font-['Orbitron'] uppercase tracking-wider">
              Konto kinnitamata
            </h1>

            {/* Message */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-300 text-center">
                Tere, <span className="font-semibold text-white">{user.name}</span>!
              </p>
              
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                <p className="text-orange-300 text-sm text-center">
                  Teie konto ootab administraatori kinnitust. Saate kasutada süsteemi kõiki funktsioone pärast kinnitamist.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  E-mail kinnitatud
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-orange-400">⏳</span>
                  Ootab administraatori kinnitust
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                Kontrolli staatust
              </button>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-900/30 to-red-800/30 hover:from-red-800/40 hover:to-red-700/40 text-red-400 border border-red-800/50 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                Logi välja
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Tavaliselt võtab kinnitamine kuni 24 tundi. Kui olete kauem oodanud, võtke ühendust administraatoriga.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}