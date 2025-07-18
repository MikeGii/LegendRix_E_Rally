'use client'

import { useState } from 'react'

export function ContactInfo() {
  const [copied, setCopied] = useState(false)

  const handleEmailClick = () => {
    navigator.clipboard.writeText('info@legendrix.ee')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tech-border rounded-2xl bg-black/90 backdrop-blur-xl p-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
          Soovid toetada?
        </h3>
        
        {/* Description */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <p className="text-gray-300 leading-relaxed">
            Kui soovid mõnda LegendRix toodet, siis võta meiega ühendust!
          </p>
          
          <p className="text-gray-400 text-sm leading-relaxed">
            Kirjuta meile, milliste toodete vastu tunned huvi, ja anname sulle edasisest tellimisprotsessist 
            ning tarnimisest detailset infot.
          </p>
        </div>
        
        {/* Email Contact */}
        <div className="space-y-4">
          <button
            onClick={handleEmailClick}
            className="group inline-flex items-center space-x-3 px-8 py-4 
                     bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 
                     hover:border-red-400/50 rounded-xl transition-all duration-300 
                     hover:shadow-[0_0_30px_rgba(255,0,64,0.4)] transform hover:scale-105"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">✉️</span>
            <div className="text-left">
              <div className="text-red-400 group-hover:text-red-300  
                           font-bold text-lg transition-colors duration-300">
                info@legendrix.ee
              </div>
            </div>
          </button>
          
          {/* Instructions */}
          <div className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4 
                        max-w-xl mx-auto backdrop-blur-sm">
            <h4 className="text-white font-['Orbitron'] font-medium mb-2 text-sm">
              KIRJA SISU:
            </h4>
            <ul className="text-gray-400 text-sm space-y-1 text-left">
              <li className="flex items-start space-x-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Milliste toodete vastu tunned huvi</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Oma nimi ja kontaktandmed</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Eelistatud tarneaeg (kui oluline)</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Response time info */}
        <div className="pt-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 
                        bg-gray-900/50 rounded-lg border border-gray-700/50">
            <span className="text-green-400">⚡</span>
            <span className="text-gray-400 font-['Rajdhani'] text-sm tracking-wider">
              Vastame esimesel võimalusel
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}