import React from 'react'
import '@/styles/futuristic-theme.css'

export function ScrollingText() {
  // Official and elegant Estonian text about the purpose of fan merchandise
  const text = "Kõik fännidele mõeldud toodete müügist saadud tulu suunatakse täielikult LegendRix E-spordi keskkonna arendamisse. See toetus võimaldab meil luua veelgi kvaliteetsemat sisu, pakkuda suuremaid ja atraktiivsemaid auhindu võistlustel ning arendada professionaalset e-spordi keskkonda. Teie toetus aitab meil viia Eesti sim-racing'u maailmakaardile."
  
  // Duplicate text for seamless loop
  const duplicatedText = `${text} • ${text} • ${text}`

  return (
    <div className="relative w-full overflow-hidden py-4 bg-black/20 backdrop-blur-sm border-y border-red-500/10">
      {/* Gradient fade on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
      
      {/* Scrolling text container */}
      <div className="relative flex">
        <div className="animate-scroll-text flex whitespace-nowrap">
          <span className="text-gray-400 text-base md:text-lg font-['Orbitron'] tracking-wide px-8">
            {duplicatedText}
          </span>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes scroll-text {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll-text {
          animation: scroll-text 60s linear infinite;
        }
        
        /* Pause on hover for readability */
        .animate-scroll-text:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}