// src/components/landing/sections/NewsSection.tsx - Futuristic Theme with Scroll Support
'use client'

import { useState, useEffect } from 'react'
import { usePublicLatestNews, useNewsArticle } from '@/hooks/news'
import { stripHtml } from '@/utils/news-utils'

// Simple time ago function
function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}p`
  return `${Math.floor(diffInSeconds / 2592000)}k`
}

interface NewsModalProps {
  isOpen: boolean
  onClose: () => void
  articleId: string
}

function NewsArticleModal({ isOpen, onClose, articleId }: NewsModalProps) {
  const { data: article, isLoading } = useNewsArticle(articleId)

  // Prevent body scroll when modal is open
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[80vh] flex">
        <div className="relative w-full tech-border rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] bg-black/95 flex flex-col">
          {/* Close button - positioned absolutely */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-modal-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <p className="mt-4 text-gray-400 font-['Orbitron'] tracking-wider">LAADIN ARTIKLIT...</p>
                </div>
              </div>
            ) : article ? (
              <div className="p-8">
                {/* Article Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-white mb-4 font-['Orbitron'] leading-tight">
                    {article.title}
                  </h1>
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-red-400/70">
                      <span className="text-red-500">📅</span>
                      <span>{new Date(article.published_at || article.created_at).toLocaleDateString('et-EE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {article.author_name && (
                      <div className="flex items-center space-x-2 text-red-400/70">
                        <span className="text-red-500">✍️</span>
                        <span>{article.author_name}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-red-400/70">
                      <span className="text-red-500">⏱️</span>
                      <span>{timeAgo(new Date(article.published_at || article.created_at))} tagasi</span>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="mt-6 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
                </div>

                {/* Cover Image with futuristic frame */}
                {article.cover_image_url && (
                  <div className="relative mb-8 group">
                    {/* Futuristic frame effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                    
                    <div className="relative rounded-xl overflow-hidden border border-red-500/20">
                      <img
                        src={article.cover_image_url}
                        alt={article.cover_image_alt || article.title}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                      
                      {/* Scan line effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/10 to-transparent h-32 transform -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out"></div>
                    </div>
                  </div>
                )}

                {/* Article Content with styled prose */}
                <div className="prose prose-invert prose-lg max-w-none">
                  <div 
                    className="text-gray-300 leading-relaxed article-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>

                {/* Bottom decoration */}
                <div className="mt-12 flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent to-red-500/50"></div>
                    <div className="w-2 h-2 bg-red-500/50 rounded-full animate-pulse"></div>
                    <div className="w-16 h-px bg-gradient-to-l from-transparent to-red-500/50"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-400">📰</span>
                  </div>
                  <p className="text-gray-400 font-['Orbitron']">ARTIKLIT EI LEITUD</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CompactNewsCardProps {
  article: {
    id: string
    title: string
    cover_image_url?: string | null
    created_at: string
  }
  onOpenArticle: (id: string) => void
}

function CompactNewsCard({ article, onOpenArticle }: CompactNewsCardProps) {
  const truncatedTitle = article.title.length > 80 
    ? `${article.title.substring(0, 80)}...` 
    : article.title

  const publishDate = new Date(article.created_at)

  return (
    <div 
      onClick={() => onOpenArticle(article.id)}
      className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer"
    >
      <div className="tech-border rounded-lg">
        <div className="p-3 md:p-4">
          {/* Top row with metadata */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-400 font-['Orbitron'] uppercase tracking-wider">
                Uudised
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {publishDate.toLocaleDateString('et-EE')}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {timeAgo(publishDate)}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-white font-semibold text-sm md:text-base leading-tight group-hover:text-red-400 transition-colors">
            {truncatedTitle}
          </h3>

          {/* Hover indicator */}
          <div className="mt-2 text-purple-400 font-['Orbitron'] text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Loe rohkem →
          </div>
        </div>
        
        {/* Bottom gradient line that animates on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500/50 transition-all duration-300"></div>
      </div>
    </div>
  )
}

export function NewsSection() {
  const { data: newsArticles = [], isLoading, error } = usePublicLatestNews(6)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  if (error) {
    console.error('Error loading news:', error)
    return null
  }

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (newsArticles.length === 0) {
    return null
  }

  return (
    <>
      <section className="py-20 relative">
        {/* Section background effects - removed purple glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4 font-['Orbitron'] tracking-wider">
              VIIMASED <span className="text-red-500">UUDISED</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Hoia end kursis viimaste sündmuste ja uuendustega
            </p>
          </div>

          {/* News List */}
          <div className="space-y-4">
            {newsArticles.map((article) => (
              <CompactNewsCard 
                key={article.id}
                article={article}
                onOpenArticle={setSelectedArticleId}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Article Modal */}
      {selectedArticleId && (
        <NewsArticleModal
          isOpen={!!selectedArticleId}
          onClose={() => setSelectedArticleId(null)}
          articleId={selectedArticleId}
        />
      )}
    </>
  )
}

// Export CompactNewsSection as an alias for NewsSection for backward compatibility
export const CompactNewsSection = NewsSection