'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import '@/styles/futuristic-theme.css'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, content: string, folder?: string) => Promise<void>
}

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [folder, setFolder] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  
  // Fetch existing folders
const { data: existingFolders = [] } = useQuery({
  queryKey: ['forum-folders'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('sub_folder')
      .not('sub_folder', 'is', null)
      .order('sub_folder')
    
    if (error) {
      console.error('Error fetching folders:', error)
      return []
    }
    
    // Get unique folders using a different approach
    const foldersMap = new Map<string, boolean>()
    data.forEach(post => {
      if (post.sub_folder) {
        foldersMap.set(post.sub_folder, true)
      }
    })
    
    // Convert map keys to array
    const uniqueFolders: string[] = []
    foldersMap.forEach((_, folderName) => {
      uniqueFolders.push(folderName)
    })
    
    return uniqueFolders.sort()
  },
  enabled: isOpen
})

  // Validation states
  const titleError = title.length > 100 ? 'Pealkiri võib olla maksimaalselt 100 tähemärki' : ''
  const contentError = content.length > 2000 ? 'Sisu võib olla maksimaalselt 2000 tähemärki' : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim() || titleError || contentError) {
      return
    }
    
    await onSubmit(title.trim(), content.trim(), folder.trim() || undefined)
    
    // Reset form
    setTitle('')
    setContent('')
    setFolder('')
    setShowNewFolder(false)
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setContent('')
      setFolder('')
      setShowNewFolder(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-black/90 backdrop-blur-xl rounded-2xl tech-border p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-['Orbitron'] uppercase tracking-wider">
            Loo uus postitus
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Folder Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 font-['Orbitron'] uppercase tracking-wider">
              Kaust (valikuline)
            </label>
            
            {!showNewFolder ? (
              <div className="space-y-2">
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white font-['Orbitron'] text-sm focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)] transition-all duration-300"
                >
                  <option value="">Vali kaust või loo uus...</option>
                  {existingFolders.map((folderName) => (
                    <option key={folderName} value={folderName}>
                      {folderName}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={() => setShowNewFolder(true)}
                  className="text-sm text-red-400 hover:text-red-300 font-['Orbitron'] uppercase tracking-wider"
                >
                  + Loo uus kaust
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Sisesta kausta nimi..."
                  className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 font-['Orbitron'] text-sm focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)] transition-all duration-300"
                  maxLength={50}
                />
                
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolder(false)
                    setFolder('')
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300 font-['Orbitron'] uppercase tracking-wider"
                >
                  ← Tagasi kaustade nimekirja
                </button>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 font-['Orbitron'] uppercase tracking-wider">
              Pealkiri
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sisesta postituse pealkiri..."
              className={`w-full px-4 py-3 bg-gray-900/80 border rounded-lg text-white placeholder-gray-500 font-['Orbitron'] text-sm focus:outline-none transition-all duration-300 ${
                titleError 
                  ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]' 
                  : 'border-gray-700/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(255,0,64,0.3)]'
              }`}
              maxLength={100}
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${titleError ? 'text-red-400' : 'text-gray-500'}`}>
                {titleError || `${title.length}/100 tähemärki`}
              </span>
            </div>
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 font-['Orbitron'] uppercase tracking-wider">
              Sisu
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Kirjuta oma postitus siia..."
              rows={6}
              className={`w-full px-4 py-3 bg-gray-900/80 border rounded-lg text-white placeholder-gray-500 font-['Orbitron'] text-sm focus:outline-none transition-all duration-300 resize-none ${
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
              <span className="text-lg">📝</span>
              <span className="font-bold">Avalda postitus</span>
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