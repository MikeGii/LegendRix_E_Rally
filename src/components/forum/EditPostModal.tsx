'use client'

import { useState, useEffect } from 'react'
import '@/styles/futuristic-theme.css'

interface EditPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, content: string) => void
  initialTitle: string
  initialContent: string
}

export function EditPostModal({ isOpen, onClose, onSubmit, initialTitle, initialContent }: EditPostModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [titleError, setTitleError] = useState('')
  const [contentError, setContentError] = useState('')

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // Update form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setContent(initialContent)
      setTitleError('')
      setContentError('')
    }
  }, [isOpen, initialTitle, initialContent])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 50) {
      setTitle(value)
      setTitleError('')
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 2000) {
      setContent(value)
      setContentError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    let hasErrors = false
    
    if (!title.trim()) {
      setTitleError('Pealkiri on kohustuslik')
      hasErrors = true
    }
    
    if (!content.trim()) {
      setContentError('Sisu on kohustuslik')
      hasErrors = true
    }
    
    if (!hasErrors) {
      onSubmit(title.trim(), content.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-900/30 to-gray-900/30 border-b border-gray-800 px-6 py-4">
          <div className="absolute inset-0 grid-pattern opacity-[0.02] pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Orbitron'] uppercase tracking-wider">
              Muuda postitust
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 text-gray-400 group-hover:text-red-400 group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 font-['Orbitron'] uppercase tracking-wider">
              Pealkiri
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Sisesta postituse pealkiri..."
              className={`w-full px-4 py-3 bg-gray-900/80 border rounded-lg text-white placeholder-gray-500 font-['Orbitron'] text-sm focus:outline-none transition-all duration-300 ${
                titleError 
                  ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]' 
                  : 'border-gray-700/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${titleError ? 'text-red-400' : 'text-gray-500'}`}>
                {titleError || `${title.length}/50 tähemärki`}
              </span>
              {!titleError && (
                <span className="text-xs text-gray-500">
                  Maksimaalselt 50 tähemärki
                </span>
              )}
            </div>
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 font-['Orbitron'] uppercase tracking-wider">
              Sisu
            </label>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Kirjuta oma postitus siia..."
              rows={8}
              className={`w-full px-4 py-3 bg-gray-900/80 border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none transition-all duration-300 resize-none ${
                contentError 
                  ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]' 
                  : 'border-gray-700/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${contentError ? 'text-red-400' : 'text-gray-500'}`}>
                {contentError || `${content.length}/2000 tähemärki`}
              </span>
              {!contentError && (
                <span className="text-xs text-gray-500">
                  Maksimaalselt 2000 tähemärki
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full group relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-300 hover:from-red-700 hover:to-red-800 overflow-hidden"
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Button content */}
            <div className="relative z-10 flex items-center justify-center space-x-2">
              <span className="text-lg">✏️</span>
              <span className="font-bold">Uuenda postitust</span>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 blur-xl bg-red-500/30"></div>
            </div>
          </button>
        </form>
      </div>
    </div>
  )
}