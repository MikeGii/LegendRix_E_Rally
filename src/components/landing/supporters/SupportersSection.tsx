// src/components/landing/supporters/SupportersSection.tsx
'use client'

import { useState, useEffect } from 'react'
import { BigSponsorsCarousel } from './BigSponsorsCarousel'
import { StreamSupportersTable } from './StreamSupportersTable'
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
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Toetajad</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Täname kõiki, kes toetavad LegendRix kogukonda ja aitavad e-spordi arengule kaasa!
          </p>
        </div>

        {/* Big Sponsors Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-white text-center mb-8">SPONSORID</h3>
          <BigSponsorsCarousel />
        </div>

        {/* Loading state for supporters check */}
        <div className="mb-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
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
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
        <h3 className="text-2xl font-semibold text-white text-center mb-8">SPONSORID</h3>
        <BigSponsorsCarousel />
      </div>

      {/* Stream Supporters Section - Only show if there are supporters */}
      {hasStreamSupporters && (
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-white text-center mb-8">STREAMELEMENTS TOETAJAD</h3>
          <StreamSupportersTable />
        </div>
      )}

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
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}