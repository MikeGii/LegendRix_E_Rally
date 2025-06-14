// src/components/landing/supporters/BigSponsorsCarousel.tsx
'use client'

import { useState, useEffect } from 'react'

// Static placeholder sponsors - will be replaced with real sponsors later
const placeholderSponsors = [
  {
    id: '1',
    name: 'Sponsor 1',
    logo_url: '/image/sponsor-placeholder-1.png',
    website_url: '#'
  },
  {
    id: '2', 
    name: 'Sponsor 2',
    logo_url: '/image/sponsor-placeholder-2.png',
    website_url: '#'
  },
  {
    id: '3',
    name: 'Sponsor 3', 
    logo_url: '/image/sponsor-placeholder-3.png',
    website_url: '#'
  }
]

export function BigSponsorsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Auto-rotate every 3 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholderSponsors.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Show 3 sponsors at a time on desktop, cycle through them
  const getVisibleSponsors = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(placeholderSponsors[(currentIndex + i) % placeholderSponsors.length])
    }
    return visible
  }

  const visibleSponsors = getVisibleSponsors()

  return (
    <div className="relative overflow-hidden">
      <div className="flex justify-center items-center space-x-8 md:space-x-12 h-32">
        {visibleSponsors.map((sponsor, index) => (
          <div
            key={`${sponsor.id}-${currentIndex}-${index}`}
            className="flex-shrink-0 transition-all duration-500 ease-in-out"
          >
            <div className="block group cursor-pointer">
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="h-16 md:h-20 w-auto object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/image/sponsor-placeholder.png'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {placeholderSponsors.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index
                ? 'bg-blue-500 w-8'
                : 'bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  )
}