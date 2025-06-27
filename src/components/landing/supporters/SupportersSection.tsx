// src/components/landing/supporters/SupportersSection.tsx - Futuristic Theme
'use client'

import { useState, useEffect } from 'react'
import { BigSponsorsCarousel } from './BigSponsorsCarousel'
import { StreamSupportersTable } from './StreamSupportersTable'
import { CompactNewsSection } from '../sections/NewsSection'
import { supabase } from '@/lib/supabase'

export function SupportersSection() {
  const [hasStreamSupporters, setHasStreamSupporters] = useState<boolean | null>(null)

  useEffect(() => {
    checkForSupporters()
  }, [])

  const checkForSupporters = async () => {
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear

      // Check current month supporters
      const { data: currentData, error: currentError } = await supabase
        .from('stream_supporters')
        .select('id')
        .eq('donation_month', currentMonth)
        .eq('donation_year', currentYear)
        .eq('is_active', true)
        .limit(1)

      if (currentError) {
        console.error('Error checking current month supporters:', currentError)
      }

      // Check previous month supporters if no current month supporters
      if (!currentData || currentData.length === 0) {
        const { data: previousData, error: previousError } = await supabase
          .from('stream_supporters')
          .select('id')
          .eq('donation_month', previousMonth)
          .eq('donation_year', previousYear)
          .eq('is_active', true)
          .limit(1)

        if (previousError) {
          console.error('Error checking previous month supporters:', previousError)
        }

        setHasStreamSupporters(previousData && previousData.length > 0)
      } else {
        setHasStreamSupporters(true)
      }
    } catch (error) {
      console.error('Error checking supporters:', error)
      setHasStreamSupporters(false)
    }
  }

  // Show loading state while checking for supporters
  if (hasStreamSupporters === null) {
    return (
      <div className="mb-32 py-16 relative">
        {/* Background Effects */}
        <div className="absolute inset-0 -top-20 -bottom-20 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
          <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
        </div>

        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-['Orbitron'] uppercase tracking-wide">
            Toetajad
          </h2>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Täname kõiki, kes toetavad LegendRix kogukonda ja aitavad e-spordi arengule kaasa!
          </p>
        </div>

        {/* Big Sponsors Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-red-500">SPONSORID</span>
          </h3>
          <BigSponsorsCarousel />
        </div>

        {/* Loading state for supporters check */}
        <div className="mb-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
        </div>

        {/* Two-column layout for QR + News during loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* QR Code Section - Loading placeholder */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-6 font-['Orbitron'] uppercase">Toeta Meid</h3>
            <div className="max-w-md mx-auto">
              <div className="futuristic-card rounded-2xl p-8">
                <div className="animate-pulse">
                  <div className="bg-gray-800 rounded-2xl w-48 h-48 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>

          {/* News Section - Will show when loaded */}
          <CompactNewsSection />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-32 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 -top-20 -bottom-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 font-['Orbitron'] uppercase tracking-wide">
          Toetajad
        </h2>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Täname kõiki, kes toetavad LegendRix kogukonda ja aitavad e-spordi arengule kaasa!
        </p>
      </div>

      {/* Big Sponsors Section */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-white text-center mb-8 font-['Orbitron'] uppercase tracking-wider">
          <span className="text-red-500">SPONSORID</span>
        </h3>
        <BigSponsorsCarousel />
      </div>

      {/* Stream Supporters Section - Only show if there are supporters */}
      {hasStreamSupporters && (
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8 font-['Orbitron'] uppercase tracking-wider">
            E-SPORDIKESKUSE TOETAJAD
          </h3>
          <StreamSupportersTable />
        </div>
      )}

      {/* Two-column layout for QR Code + News - Equal Heights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* QR Code Section with futuristic styling */}
        <div className="text-center h-full">
          <h3 className="text-2xl font-bold text-white mb-6 font-['Orbitron'] uppercase">Toeta Meid</h3>
          <div className="max-w-md mx-auto h-full">
            <div className="group relative futuristic-card rounded-2xl p-8 hover:scale-105 transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-transparent transition-all duration-300"></div>
              
              {/* QR Code Container */}
              <div className="relative mb-6 z-10 flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white rounded-2xl p-4 mx-auto w-fit shadow-2xl">
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
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-4 relative z-10 flex-grow flex flex-col justify-between">
                <div>
                  <a 
                    href="https://streamelements.com/legend_rix/tip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-400 font-['Orbitron'] hover:text-orange-300 hover:underline transition-colors duration-200 block"
                  >
                    streamelements.com/legend_rix/tip
                  </a>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    Skaneeri QR-koodi, et toetada meie laiv tegemisi ja e-spordi kogukonda.
                  </p>
                </div>
                <div className="text-orange-400 font-['Orbitron'] text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Toeta meid →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News Section */}
        <CompactNewsSection />
      </div>
    </div>
  )
}