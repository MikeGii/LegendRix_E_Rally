// src/components/landing/sections/SocialMediaSection.tsx - Futuristic Theme
export function SocialMediaSection() {
  return (
    <div className="text-center mt-32 mb-0 pt-16 relative">
      {/* Background accent lines */}
      <div className="absolute inset-0 -top-20 -bottom-20 overflow-hidden pointer-events-none">
        <div className="absolute bottom-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      </div>

      <h4 className="text-2xl font-black text-white mb-12 font-['Orbitron'] uppercase tracking-wider">
        Jälgi meid sotsiaalmeedias
      </h4>
      

      <div className="flex justify-center items-center gap-8">
        
        {/* Facebook */}
        <a 
          href="https://www.facebook.com/risto.oeselg" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>
        </a>
        
        {/* Instagram */}
        <a 
          href="https://www.instagram.com/legend_rix/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.618-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
          </div>
        </a>

        {/* TikTok */}
        <a 
          href="https://www.tiktok.com/@legend_rix" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
          </div>
        </a>

        {/* Twitch */}
        <a 
          href="https://www.twitch.tv/legend_rix" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
              </svg>
            </div>
          </div>
        </a>

        {/* YouTube */}
        <a 
          href="https://www.youtube.com/@legend_rix" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
          </div>
        </a>

        {/* Discord */}
        <a 
          href="https://discord.gg/uaE9pkD7Ym" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.195.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
              </svg>
            </div>
          </div>
        </a>

        {/* Steam */}
        <a 
          href="https://steamcommunity.com/id/legendrix" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative"
        >
          <div className="relative w-16 h-16">
            {/* Red glow effect on hover */}
            <div className="absolute inset-0 bg-red-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            
            {/* Button */}
            <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-700/50 group-hover:border-red-500/50 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-gray-500 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.775-1.122-1.401-1.381c-.277-.116-.565-.176-.856-.174l1.51.625c.956.394 1.393 1.51.997 2.465-.397.957-1.516 1.404-2.428 1.149z"/>
              </svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}