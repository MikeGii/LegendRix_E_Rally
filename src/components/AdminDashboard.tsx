// src/components/AdminDashboard.tsx - Futuristic Black-Red Theme
'use client'

import { useUserStats } from '@/hooks/useOptimizedUsers'
import { AdminQuickButtons } from '@/components/admin/AdminQuickButtons'
import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import '@/styles/futuristic-theme.css'
import '@/styles/user-dashboard.css'

export function AdminDashboard() {
  const { user } = useAuth()
  const userStats = useUserStats()
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString('et-EE', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  })
  
  const dateString = currentTime.toLocaleDateString('et-EE', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements - Same as User Dashboard */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '4s' }}></div>
        
        {/* Scan Line Effect */}
        <div className="scan-line"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Admin Header - Futuristic Style */}
        <div className="tech-border rounded-2xl shadow-[0_0_40px_rgba(255,0,64,0.3)] bg-black/90 backdrop-blur-xl p-8 relative overflow-hidden">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 grid-pattern opacity-[0.03] pointer-events-none"></div>
          
          {/* Scanning Line Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="scan-line"></div>
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gray-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Admin Logo */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 opacity-30 pointer-events-none">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="text-8xl text-red-500/20 font-['Orbitron'] font-black">⚙️</div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Time and Date Display */}
            <div className="flex justify-between items-start mb-6">
              <div className="text-xs text-gray-500 font-['Orbitron'] tracking-wider">
                <div className="text-red-400 font-bold">{timeString}</div>
                <div className="capitalize">{dateString}</div>
              </div>
              
              {/* System Status */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                <span className="text-gray-500 font-['Orbitron']">ADMIN PANEEL AKTIIVNE</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Admin Avatar with Futuristic Frame */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-red-900/50 to-purple-900/50">
                    {/* Animated Border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-red-500 via-purple-500 to-red-500 bg-clip-border animate-gradient-shift"></div>
                    
                    {/* Inner Content */}
                    <div className="absolute inset-1 bg-black rounded-xl flex items-center justify-center">
                      <span className="text-3xl font-black text-transparent bg-gradient-to-br from-red-400 to-purple-400 bg-clip-text font-['Orbitron']">
                        A
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-black shadow-[0_0_15px_rgba(34,197,94,0.8)]"></div>
                </div>
                
                {/* Welcome Text */}
                <div>
                  <div className="text-xs text-gray-500 font-['Orbitron'] tracking-wider uppercase mb-1">
                    Admin Dashboard
                  </div>
                  <h1 className="text-4xl font-black text-white font-['Orbitron'] tracking-wider">
                    TERE, <span className="text-glow-red uppercase">{user?.name || 'ADMIN'}</span>
                  </h1>
                  <p className="text-gray-400 mt-1 text-sm font-['Rajdhani']">
                    Süsteemi halduspaneel • Täielik juurdepääs
                  </p>
                </div>
              </div>
              
              {/* Integrated Minimal Stats */}
              <div className="hidden lg:flex items-center space-x-8">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 uppercase">Kasutajaid</span>
                    <span className="text-xl font-bold text-white font-['Orbitron']">{userStats.totalUsers}</span>
                  </div>
                </div>
                
                <div className="h-8 w-px bg-gray-700"></div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 uppercase">Kinnituse ootel</span>
                    <span className={`text-xl font-bold font-['Orbitron'] ${userStats.pendingApproval > 0 ? 'text-yellow-400 animate-pulse' : 'text-green-500'}`}>
                      {userStats.pendingApproval}
                    </span>
                  </div>
                </div>
                
                {userStats.pendingEmail > 0 && (
                  <>
                    <div className="h-8 w-px bg-gray-700"></div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 uppercase">Email kinnitamata</span>
                        <span className="text-xl font-bold text-orange-400 font-['Orbitron']">
                          {userStats.pendingEmail}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile Stats */}
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-800 flex items-center justify-around">
              <div className="text-center">
                <div className="text-lg font-bold text-white font-['Orbitron']">{userStats.totalUsers}</div>
                <div className="text-xs text-gray-500">Kasutajaid</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold font-['Orbitron'] ${userStats.pendingApproval > 0 ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`}>
                  {userStats.pendingApproval}
                </div>
                <div className="text-xs text-gray-500">Kinnituse ootel</div>
              </div>
              {userStats.pendingEmail > 0 && (
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400 font-['Orbitron']">
                    {userStats.pendingEmail}
                  </div>
                  <div className="text-xs text-gray-500">Email kinnitamata</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons - User Dashboard Style */}
        <AdminQuickButtons />
        
        {/* Floating Action Indicators - Only show if there are pending items */}
        {(userStats.pendingApproval > 0 || userStats.pendingEmail > 0) && (
          <div className="fixed bottom-8 right-8">
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 backdrop-blur-xl shadow-[0_0_30px_rgba(255,0,64,0.3)] animate-pulse cursor-pointer hover:scale-105 transition-transform"
                 onClick={() => window.location.href = '/user-management'}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500/30 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-red-400">
                    {userStats.pendingApproval + userStats.pendingEmail} tegevust ootel
                  </div>
                  <div className="text-xs text-red-300/70">Kliki siia vaatamiseks</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}