// src/components/landing/edetabel/PaginationControls.tsx
'use client'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationControlsProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="First page"
      >
        ««
      </button>
      
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        ‹
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-1 text-sm rounded-lg transition-all ${
              page === currentPage
                ? 'bg-red-600/20 text-red-400 border border-red-500/50'
                : page === '...'
                ? 'text-gray-600 cursor-default'
                : 'bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/50'
            }`}
            aria-label={typeof page === 'number' ? `Page ${page}` : 'More pages'}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        ›
      </button>
      
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Last page"
      >
        »»
      </button>
    </div>
  )
}