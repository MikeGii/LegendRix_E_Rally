'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import { ForumHeader } from '@/components/forum/ForumHeader'
import { CreatePostModal } from '@/components/forum/CreatePostModal'
import { ForumPosts } from '@/components/forum/ForumPosts'
import '@/styles/futuristic-theme.css'

export default function ForumPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = (query: string) => {
    console.log('Searching for:', query)
    // TODO: Implement search logic
  }

  const handleCreatePost = () => {
    setShowCreateModal(true)
  }

  const handleSubmitPost = (title: string, content: string) => {
    console.log('New post:', { title, content })
    // TODO: Implement post submission logic
    setShowCreateModal(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Same as rules page */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-b border-red-500/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20 sm:h-24 py-4 sm:py-6">
            {/* Logo with futuristic styling and pulsing effect */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500 blur-xl sm:blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-500/30 bg-gradient-to-br from-red-600/20 to-purple-600/20 backdrop-blur-sm p-1 group-hover:ring-red-500/50 transition-all neon-glow">
                  <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden relative">
                    <Image
                      src="/image/rally-cover.png"
                      alt="LegendRix Rally"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 640px) 48px, 56px"
                    />
                  </div>
                </div>
              </div>
              <h1 
                className="text-xl sm:text-3xl font-black text-white font-['Orbitron'] tracking-wider cursor-pointer"
                onClick={() => router.push('/')}
              >
                LEGEND<span className="text-red-500">RIX</span>
              </h1>
            </div>

            {/* Desktop Navigation buttons - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="group px-6 py-3 bg-black/60 backdrop-blur-sm rounded-xl border-2 border-gray-700/50 hover:border-gray-600 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/0 via-gray-600/10 to-gray-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative text-sm font-medium text-gray-400 group-hover:text-gray-300 font-['Orbitron'] tracking-wider uppercase">
                  Pealehele
                </span>
              </button>
              {user && (
                <button
                  onClick={() => router.push('/user-dashboard')}
                  className="group px-6 py-3 bg-black/60 backdrop-blur-sm rounded-xl border-2 border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,64,0.3)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative text-sm font-bold text-red-400 group-hover:text-red-300 font-['Orbitron'] tracking-wider uppercase">
                    Töölaud
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button - Visible only on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative z-50 p-2 text-white"
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay - Only visible on mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
              <button
                onClick={() => {
                  router.push('/')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full max-w-xs tech-border group px-6 py-4 text-white rounded-lg font-bold transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-lg">🏠</span>
                  <span className="font-['Orbitron']">PEALEHELE</span>
                </div>
              </button>
              
              {user && (
                <button
                  onClick={() => {
                    router.push('/user-dashboard')
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full max-w-xs tech-border group px-6 py-4 text-white rounded-lg font-bold transition-all duration-300"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-lg">⚡</span>
                    <span className="font-['Orbitron']">TÖÖLAUD</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-white font-['Orbitron'] tracking-wider mb-4">
              <span className="text-red-500">FOORUM</span>
            </h1>
            <p className="text-gray-400 text-lg">
              LegendRix kogukonna arutelud ja teadaanded
            </p>
          </div>

          {/* Forum Header with Search and Create Post */}
          <div className="max-w-6xl mx-auto mb-8">
            <ForumHeader 
              onSearch={handleSearch}
              onCreatePost={handleCreatePost}
            />
          </div>

          {/* Forum Posts Table */}
          <div className="max-w-6xl mx-auto">
            <ForumPosts />
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitPost}
      />
    </div>
  )
}