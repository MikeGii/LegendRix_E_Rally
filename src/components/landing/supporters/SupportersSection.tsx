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
      <div>
        <h3 className="text-2xl font-semibold text-white text-center mb-8">Streamline Toetajad</h3>
        <StreamSupportersTable />
      </div>
    </div>
  )
}