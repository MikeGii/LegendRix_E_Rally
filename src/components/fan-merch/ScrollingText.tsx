import React from "react";
import "@/styles/futuristic-theme.css";

export function ScrollingText() {
  // Official and elegant Estonian text about the purpose of fan merchandise
  const text =
    "Kõik fännidele mõeldud toodete tellimisest saadud toetus suunatakse täielikult LegendRix E-spordi keskkonna arendamisse. See toetus võimaldab meil luua veelgi kvaliteetsemat sisu, pakkuda suuremaid ja atraktiivsemaid auhindu võistlustel ning arendada professionaalset e-spordi keskkonda. Teie toetus aitab meil viia Eesti sim-racing'u maailmakaardile.";

  // Duplicate texts for seamless loop
  const duplicatedText = `${text} • ${text} • ${text}`

  return (
    <div className="relative w-full overflow-hidden py-4 bg-black/20 backdrop-blur-sm border-y border-red-500/10">
      {/* Desktop - Scrolling text */}
      <div className="hidden md:block">
        {/* Gradient fade on edges - Desktop only */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
        
        <div className="relative flex">
          <div className="scrolling-text-desktop flex whitespace-nowrap">
            <span className="text-gray-400 text-base md:text-lg font-['Orbitron'] tracking-wide px-8">
              {duplicatedText}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile - Static justified text */}
      <div className="block md:hidden">
        <div className="px-4">
          <p className="text-gray-400 text-sm font-['Orbitron'] tracking-wide leading-relaxed text-justify">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}
