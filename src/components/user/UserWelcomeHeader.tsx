// src/components/user/UserWelcomeHeader.tsx - REDESIGNED WITH FUTURISTIC BLACK-RED-GRAY THEME
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface UserWelcomeHeaderProps {
  userName: string
  isAdminAsUser: boolean
}

export function UserWelcomeHeader({ userName, isAdminAsUser }: UserWelcomeHeaderProps) {
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
      
      {/* Rally Logo - Futuristic Design */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-48 opacity-30 pointer-events-none">
        <div className="relative w-full h-full">
          {/* Custom SVG Rally Logo */}
          <svg viewBox="0 0 200 200" className="w-full h-full animate-spin" style={{ animationDuration: '30s' }}>
            <defs>
              <linearGradient id="rallyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF0040" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#666666" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF0040" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Outer Ring */}
            <circle cx="100" cy="100" r="90" fill="none" stroke="url(#rallyGradient)" strokeWidth="2" opacity="0.5" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="url(#rallyGradient)" strokeWidth="1" strokeDasharray="5 5" />
            
            {/* Inner Rings */}
            <circle cx="100" cy="100" r="70" fill="none" stroke="#FF0040" strokeWidth="1.5" opacity="0.7" filter="url(#glow)" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#666666" strokeWidth="1" opacity="0.5" />
            
            {/* Speed Lines */}
            <path d="M 30 100 L 70 100" stroke="#FF0040" strokeWidth="3" strokeLinecap="round" opacity="0.8" filter="url(#glow)" />
            <path d="M 130 100 L 170 100" stroke="#FF0040" strokeWidth="3" strokeLinecap="round" opacity="0.8" filter="url(#glow)" />
            
            {/* Checkered Flag Pattern */}
            <g transform="translate(75, 75)">
              <rect x="0" y="0" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="10" y="0" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="20" y="0" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="30" y="0" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="40" y="0" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              
              <rect x="0" y="10" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="10" y="10" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="20" y="10" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="30" y="10" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="40" y="10" width="10" height="10" fill="#000000" opacity="0.9" />
              
              <rect x="0" y="20" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="10" y="20" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="20" y="20" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="30" y="20" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="40" y="20" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              
              <rect x="0" y="30" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="10" y="30" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="20" y="30" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="30" y="30" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="40" y="30" width="10" height="10" fill="#000000" opacity="0.9" />
              
              <rect x="0" y="40" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="10" y="40" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="20" y="40" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
              <rect x="30" y="40" width="10" height="10" fill="#000000" opacity="0.9" />
              <rect x="40" y="40" width="10" height="10" fill="#FFFFFF" opacity="0.9" />
            </g>
            
            {/* Center Text */}
            <text x="100" y="155" textAnchor="middle" fill="#FF0040" fontSize="16" fontFamily="Orbitron" fontWeight="bold" letterSpacing="2">
              RALLY
            </text>
          </svg>
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
            <span className="text-gray-500 font-['Orbitron']">SÜSTEEM AKTIIVNE</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* User Avatar with Futuristic Frame */}
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden ${
                isAdminAsUser 
                  ? 'bg-gradient-to-br from-red-900/50 to-purple-900/50' 
                  : 'bg-gradient-to-br from-gray-900/50 to-red-900/30'
              }`}>
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-red-500 via-gray-500 to-red-500 bg-clip-border animate-gradient-shift"></div>
                
                {/* Inner Content */}
                <div className="absolute inset-1 bg-black rounded-xl flex items-center justify-center">
                  <span className="text-3xl font-black text-transparent bg-gradient-to-br from-red-400 to-gray-400 bg-clip-text font-['Orbitron']">
                    {isAdminAsUser ? '👑' : userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Corner Indicator */}
                {isAdminAsUser && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
                )}
              </div>
            </div>
            
            {/* Welcome Text */}
            <div>
              <div className="flex items-baseline space-x-3">
                <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-red-400 via-white to-gray-400 bg-clip-text font-['Orbitron'] uppercase tracking-wider">
                  Tere tulemast
                </h1>
                {isAdminAsUser && (
                  <span className="text-xs font-['Orbitron'] text-purple-400 uppercase tracking-widest bg-purple-900/30 px-2 py-1 rounded-md border border-purple-500/30">
                    Admin Mode
                  </span>
                )}
              </div>
              
              <div className="mt-2 flex items-center space-x-3">
                <span className="text-2xl font-bold text-white font-['Orbitron']">
                  {userName}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 via-gray-500/30 to-transparent"></div>
              </div>
              
              <p className="text-sm text-gray-500 mt-2 font-['Orbitron'] tracking-wide">
                {isAdminAsUser 
                  ? 'ADMINISTRAATOR • SÕITJA REŽIIM • KÕIK ÕIGUSED' 
                  : 'RALLISÕITJA • AKTIIVNE KASUTAJA'
                }
              </p>
            </div>
          </div>
          
          {/* Stats Panel */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Activity Indicator */}
            <div className="text-right">
              <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Aktiivsus</div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-${i * 2} bg-gradient-to-t ${i > 3 ? 'from-red-600 to-red-400' : 'from-gray-600 to-gray-400'} rounded-sm`}
                      style={{ height: `${i * 8}px` }}
                    ></div>
                  ))}
                </div>
                <span className="text-lg font-bold text-red-400 font-['Orbitron']">85%</span>
              </div>
            </div>
            
            {/* Access Level */}
            <div className="text-right">
              <div className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Ligipääs</div>
              <div className="mt-1 text-lg font-bold font-['Orbitron']">
                {isAdminAsUser ? (
                  <span className="text-transparent bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text">TÄIELIK</span>
                ) : (
                  <span className="text-green-400">KINNITATUD</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Tech Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
      </div>
    </div>
  )
}