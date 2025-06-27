// src/components/landing/Footer.tsx - Futuristic Theme
export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-red-500/20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-950 to-transparent opacity-50"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Contact Section */}
          <div className="text-center md:text-left">
            <h5 className="text-lg font-bold text-white mb-2 font-['Orbitron'] uppercase tracking-wider">
              Kontakt
            </h5>
            <a 
              href="mailto:info@legendrix.ee" 
              className="text-gray-500 hover:text-red-500 transition-colors duration-300"
            >
              info@legendrix.ee
            </a>
          </div>

          {/* Divider for mobile */}
          <div className="hidden md:block w-px h-12 bg-red-500/20"></div>

          {/* Copyright Section */}
          <div className="text-center md:text-right">
            <p className="text-gray-500 text-sm">
              © 2025 LegendRix. Kõik õigused kaitstud.
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-8 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      </div>
    </footer>
  )
}