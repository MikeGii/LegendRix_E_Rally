// src/components/landing/supporters/BigSponsorsCarousel.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface BigSponsor {
  id: string
  name: string
  logo_url: string
  website_url?: string
  display_order: number
  is_active: boolean
}

export function BigSponsorsCarousel() {
  const [sponsors, setSponsors] = useState<BigSponsor[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSponsors()
  }, [])

  useEffect(() => {
    if (sponsors.length > 0) {
      // Auto-rotate every 4 seconds if there are sponsors
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [sponsors.length])

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('big_sponsors')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching sponsors:', error)
      } else {
        setSponsors(data || [])
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <div className="flex justify-center items-center space-x-8 md:space-x-12 h-32">
          <div className="w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // If no sponsors, show placeholder message
  if (sponsors.length === 0) {
    return (
      <div className="relative overflow-hidden">
        <div className="flex justify-center items-center h-32">
          <p className="text-slate-400 text-center">Sponsoreid pole veel lisatud</p>
        </div>
      </div>
    )
  }

  // Get visible sponsors (show max 3 at a time)
  const getVisibleSponsors = () => {
    const visible = []
    const maxVisible = Math.min(3, sponsors.length)
    
    for (let i = 0; i < maxVisible; i++) {
      visible.push(sponsors[(currentIndex + i) % sponsors.length])
    }
    return visible
  }

  const visibleSponsors = getVisibleSponsors()

  const handleSponsorClick = (sponsor: BigSponsor) => {
    if (sponsor.website_url && sponsor.website_url !== '#') {
      window.open(sponsor.website_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="flex justify-center items-center space-x-8 md:space-x-12 h-32">
        {visibleSponsors.map((sponsor, index) => (
          <div
            key={`${sponsor.id}-${currentIndex}-${index}`}
            className="flex-shrink-0 transition-all duration-500 ease-in-out"
          >
            <div 
              className={`block group ${sponsor.website_url && sponsor.website_url !== '#' ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => handleSponsorClick(sponsor)}
            >
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="h-16 md:h-20 w-auto object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  console.error(`Failed to load sponsor logo: ${sponsor.logo_url}`)
                  ;(e.target as HTMLImageElement).src = '/image/sponsor-placeholder.png'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots - only show if more than 1 sponsor */}
      {sponsors.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {sponsors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'bg-blue-500 w-8'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Näita sponsorit ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}