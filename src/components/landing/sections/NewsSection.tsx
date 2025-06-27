// src/components/landing/sections/NewsSection.tsx - Futuristic Theme
'use client'

import { useState } from 'react'
import { usePublicLatestNews, useNewsArticle } from '@/hooks/news'
import { Modal } from '@/components/ui/Modal'
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

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={article?.title}
    >
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-500">Laen artiklit...</span>
          </div>
        ) : article ? (
          <div className="space-y-6">
            {article.cover_image_url && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <img
                  src={article.cover_image_url}
                  alt={article.cover_image_alt || article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>📅 {new Date(article.published_at || article.created_at).toLocaleDateString('et-EE')}</span>
              {article.author_name && (
                <span>👤 {article.author_name}</span>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              <div 
                className="text-gray-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-gray-500">Artiklit ei leitud</span>
          </div>
        )}
      </div>
    </Modal>
  )
}

interface CompactNewsCardProps {
  article: {
    id: string
    title: string
    cover_image_url?: string | null
    created_at: string
    content: string
  }
  onClick: () => void
}

function CompactNewsCard({ article, onClick }: CompactNewsCardProps) {
  // Strip HTML tags from content before creating excerpt
  const plainTextContent = stripHtml(article.content)
  const excerpt = plainTextContent.length > 80 
    ? plainTextContent.substring(0, 80) + '...'
    : plainTextContent

  const timeAgoText = timeAgo(new Date(article.created_at))

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer futuristic-card rounded-xl p-4 hover:scale-105 transition-all duration-300 overflow-hidden relative"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
      
      <div className="flex space-x-3 relative z-10">
        {/* Small image with futuristic border */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-800/50 ring-1 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
          {article.cover_image_url ? (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-red-600/20 flex items-center justify-center">
              <span className="text-lg opacity-60">📰</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors font-['Orbitron'] uppercase tracking-wide">
              {article.title}
            </h4>
            <span className="text-xs text-gray-600 ml-2 flex-shrink-0 font-['Orbitron']">
              {timeAgoText}
            </span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </div>
      </div>
    </div>
  )
}

export function CompactNewsSection() {
  const { data: latestNews = [], isLoading } = usePublicLatestNews(3)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  // Don't render if no news or loading
  if (isLoading || latestNews.length === 0) {
    return null
  }

  return (
    <>
      {/* Compact News Section with futuristic styling - Matching QR section height */}
      <div className="text-center h-full">
        <h3 className="text-2xl font-bold text-white mb-6 font-['Orbitron'] uppercase">Teated</h3>
        <div className="max-w-md mx-auto h-full">
          <div className="group relative futuristic-card rounded-2xl p-8 hover:scale-105 transition-all duration-300 overflow-hidden h-full flex flex-col">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
            
            {/* Compact news list */}
            <div className="space-y-3 relative z-10 flex-grow">
              {latestNews.slice(0, 3).map((article, index) => (
                <CompactNewsCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticleId(article.id)}
                />
              ))}
            </div>

            {/* Footer text */}
            <div className="mt-6 pt-6 border-t border-gray-800/50 relative z-10">
              <p className="text-gray-400 text-sm leading-relaxed">
                Jälgi meie uusimaid uudiseid ja teateid kogukonnast.
              </p>
              <div className="text-purple-400 font-['Orbitron'] text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                Loe rohkem →
              </div>
            </div>
          </div>
        </div>
      </div>

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