// src/components/landing/Footer.tsx - Compact Black and Red Theme
export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-red-500/30">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h5 className="text-sm font-bold text-red-500 mb-1 font-['Orbitron'] uppercase tracking-wider">
              Kontakt
            </h5>
            <a 
              href="mailto:info@legendrix.ee" 
              className="text-red-400/70 hover:text-red-400 transition-colors duration-300 text-sm"
            >
              info@legendrix.ee
            </a>
          </div>

          {/* Divider for desktop */}
          <div className="hidden md:block w-px h-8 bg-red-500/30"></div>

          {/* Copyright Section */}
          <div className="text-center md:text-right">
            <p className="text-red-400/70 text-xs">
              © 2025 LegendRix. Kõik õigused kaitstud.
            </p>
          </div>
        </div>

        {/* Bottom accent line - thinner and more subtle */}
        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      </div>
    </footer>
  )
}