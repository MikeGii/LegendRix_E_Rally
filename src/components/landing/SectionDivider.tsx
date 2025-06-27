// src/components/landing/SectionDivider.tsx
'use client'

interface SectionDividerProps {
  variant?: 'z-pattern' | 'l-corners' | 'mixed'
}

export function SectionDivider({ variant = 'mixed' }: SectionDividerProps) {
  return (
    <div className="section-divider">
      {/* Main line */}
      <div className="absolute inset-0"></div>
      
      {variant === 'z-pattern' && (
        <>
          {/* Left Z pattern */}
          <div className="divider-accent divider-accent-left">
            <div className="z-pattern">
              <div className="z-pattern-diagonal"></div>
            </div>
          </div>
          
          {/* Center dot */}
          <div className="divider-accent divider-accent-center">
            <div className="w-2 h-2 bg-red-500/40 rounded-full"></div>
          </div>
          
          {/* Right Z pattern */}
          <div className="divider-accent divider-accent-right">
            <div className="z-pattern">
              <div className="z-pattern-diagonal"></div>
            </div>
          </div>
        </>
      )}
      
      {variant === 'l-corners' && (
        <>
          {/* Left L corner */}
          <div className="divider-accent divider-accent-left">
            <div className="l-corner"></div>
          </div>
          
          {/* Center geometric shape */}
          <div className="divider-accent divider-accent-center">
            <div className="w-8 h-8 border border-red-500/30 rotate-45"></div>
          </div>
          
          {/* Right L corner */}
          <div className="divider-accent divider-accent-right">
            <div className="l-corner-right"></div>
          </div>
        </>
      )}
      
      {variant === 'mixed' && (
        <>
          {/* Left accent - small square */}
          <div className="absolute top-0 left-10 w-px h-6 bg-gradient-to-b from-red-500/40 to-transparent -translate-y-3"></div>
          
          {/* Left Z pattern */}
          <div className="absolute top-0 left-1/4 -translate-y-1/2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-px bg-red-500/40"></div>
              <div className="w-px h-4 bg-red-500/40 transform -skew-x-12"></div>
              <div className="w-4 h-px bg-red-500/40"></div>
            </div>
          </div>
          
          {/* Center diamond */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border border-red-500/50 rotate-45 bg-black"></div>
          </div>
          
          {/* Right L pattern */}
          <div className="absolute top-0 right-1/4 -translate-y-1/2">
            <div className="w-4 h-4 border-l border-t border-red-500/40"></div>
          </div>
          
          {/* Right accent */}
          <div className="absolute top-0 right-10 w-px h-6 bg-gradient-to-b from-red-500/40 to-transparent -translate-y-3"></div>
        </>
      )}
    </div>
  )
}