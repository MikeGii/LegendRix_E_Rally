// src/components/landing/supporters/SupportersSection.tsx
import { BigSponsorsCarousel } from './BigSponsorsCarousel'
import { StreamSupportersTable } from './StreamSupportersTable'

export function SupportersSection() {
  return (
    <div className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Toetajad</h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Täname kõiki, kes toetavad LegendRix kogukonda ja aitavad e-spordi arengule kaasa!
        </p>
      </div>

      {/* Big Sponsors Section */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-white text-center mb-8">Peamised Toetajad</h3>
        <BigSponsorsCarousel />
      </div>

      {/* Stream Supporters Section */}
      <div className="mb-16">
        <h3 className="text-2xl font-semibold text-white text-center mb-8">Streamline Toetajad</h3>
        <StreamSupportersTable />
      </div>

      {/* Donation QR Code Section */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-6">Toeta Meid</h3>
        <div className="max-w-md mx-auto">
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 hover:border-slate-700/50 transition-all duration-300 group">
            {/* QR Code Container with enhanced styling */}
            <div className="relative mb-6">
              <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300">
                <img
                  src="/image/streamlineqr.png"
                  alt="Streamline donation QR code"
                  className="w-48 h-48 mx-auto rounded-xl"
                  onError={(e) => {
                    console.error('QR code image failed to load')
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
              {/* Decorative glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <a 
                href="https://streamelements.com/legend_rix/tip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 italic font-light hover:text-blue-300 hover:underline transition-colors duration-200 block mt-3"
              >
                https://streamelements.com/legend_rix/tip
              </a>
              <p className="text-slate-300 leading-relaxed">
                Skaneeri QR-koodi, et toetada meie laiv tegemisi ja e-spordi kogukonda. 
                Iga toetus aitab meil luua paremat sisu ja korraldada põnevamaid võistlusi!
              </p>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}