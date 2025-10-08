// src/components/admin/AdminQuickButtons.tsx - User Dashboard Style with Full Descriptions
'use client'

import { useState } from 'react'

export function AdminQuickButtons() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  const handleNavigation = (href: string) => {
    window.location.href = href
  }

  const buttons = [
    {
      id: 'users',
      title: 'Kasutajate haldamine',
      description: 'Halda ja kinnita kasutajakontosid',
      icon: '👥',
      href: '/user-management'
    },
    {
      id: 'games',
      title: 'Mängude haldamine',
      description: 'Halda ja loo mänge ning nende komponente, radu, autosid, klasse ja kõike muud',
      icon: '🎮',
      href: '/game-management'
    },
    {
      id: 'rallies',
      title: 'Rallide haldamine',
      description: 'Loo ja manageeri olemasolevaid rallisid olemasolevate mängu komponentide põhjal',
      icon: '🏁',
      href: '/rally-management'
    },
    {
      id: 'news',
      title: 'Kalender',
      description: 'Halda kalendris toimuvaid sündmuseid',
      icon: '📰',
      href: '/calendar-management'
    },
    {
      id: 'championships',
      title: 'Võistlusseeriad',
      description: 'Loo ja halda erinevaid võistlusseeriaid ühendades kokku omavahel mitmeid rallisid',
      icon: '🏆',
      href: '/championships'
    },
    {
      id: 'results',
      title: 'Tulemused',
      description: 'Sisesta ja kinnita lõppenud võistlused',
      icon: '📊',
      href: '/results'
    },
    {
      id: 'sponsors',
      title: 'Sponsorid',
      description: 'Halda oma partnereid ja toetajaid',
      icon: '🤝',
      href: '/sponsors'
    },
    {
      id: 'teams',
      title: 'Tiimide manageerimine',
      description: 'Loo ja halda tiime ning määra tiimidele pealikud',
      icon: '👥',
      href: '/teams-manager'
    },
    {
      id: 'home',
      title: 'Pealeht',
      description: 'Mine avalehele',
      icon: '🌐',
      href: '/'
    }
  ]

  const renderButton = (button: typeof buttons[0]) => (
    <button
      key={button.id}
      onClick={() => handleNavigation(button.href)}
      onMouseEnter={() => setHoveredItem(button.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
        group relative p-5 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer transform
        bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-800 
        hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] hover:scale-[1.02]
        min-h-[140px] flex flex-col
      `}
    >
      {/* Animated sweep effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon with animation */}
        <div className="mb-3 relative">
          <span className="text-3xl block group-hover:scale-110 transition-transform duration-300">
            {button.icon}
          </span>
          {hoveredItem === button.id && (
            <div className="absolute inset-0 blur-xl bg-red-500/20 rounded-full animate-pulse pointer-events-none"></div>
          )}
        </div>
        
        {/* Text content */}
        <div className="flex-grow">
          <h3 className="font-bold text-white text-sm font-['Orbitron'] uppercase tracking-wider mb-2 
                       group-hover:text-red-400 transition-colors duration-300">
            {button.title}
          </h3>
          <p className="text-xs text-gray-400 font-['Rajdhani'] group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
            {button.description}
          </p>
        </div>
      </div>
      
      {/* Corner accent on hover */}
      <div className="absolute -top-1 -right-1 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-full h-full bg-red-500/20 rounded-bl-xl"></div>
      </div>
      
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/50 transition-all duration-300"></div>
    </button>
  )

  return (
    <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl p-6 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Gradient orb for depth */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* 3x3 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {buttons.map(renderButton)}
      </div>
    </div>
  )
}