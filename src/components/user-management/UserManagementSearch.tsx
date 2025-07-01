// src/components/user-management/UserManagementSearch.tsx - Redesigned with Futuristic Theme
interface UserManagementSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function UserManagementSearch({ searchTerm, onSearchChange }: UserManagementSearchProps) {
  return (
    <div className="relative">
      {/* Search Input Container */}
      <div className="relative group">
        {/* Animated Border Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
        
        {/* Main Search Container */}
        <div className="relative flex items-center">
          {/* Search Icon */}
          <div className="absolute left-4 flex items-center pointer-events-none z-10">
            <div className="relative">
              <span className="text-2xl text-gray-400 group-hover:text-red-400 transition-colors duration-300">🔍</span>
              {/* Pulse effect on icon */}
              <div className="absolute inset-0 animate-ping">
                <span className="text-2xl text-red-400 opacity-20">🔍</span>
              </div>
            </div>
          </div>
          
          {/* Input Field */}
          <input
            type="text"
            placeholder="Otsi kasutajaid nime, e-maili või mängijanime järgi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-14 pr-4 py-4 
                     bg-black/50 backdrop-blur-sm
                     border border-gray-800 rounded-xl
                     text-white placeholder-gray-500 
                     font-['Orbitron'] tracking-wide
                     focus:border-red-500/50 focus:outline-none 
                     focus:ring-2 focus:ring-red-500/20 
                     hover:border-gray-700
                     transition-all duration-300"
          />
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 p-2 
                       bg-gradient-to-r from-gray-800 to-gray-900
                       hover:from-red-900/50 hover:to-red-800/50
                       border border-gray-700 hover:border-red-500/50
                       rounded-lg transition-all duration-300
                       group/clear"
            >
              <svg 
                className="w-5 h-5 text-gray-400 group-hover/clear:text-red-400 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Search Status Indicator */}
      {searchTerm && (
        <div className="absolute -bottom-6 left-0 flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400 font-['Orbitron']">
            Otsin: <span className="text-red-400">{searchTerm}</span>
          </span>
        </div>
      )}
    </div>
  )
}