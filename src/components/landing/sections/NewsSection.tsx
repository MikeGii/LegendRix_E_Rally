// src/components/landing/sections/NewsSection.tsx
'use client'

import { useState } from 'react'
import { usePublicLatestNews, useNewsArticle } from '@/hooks/news'
import { Modal } from '@/components/ui/Modal'

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
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-400">Laen artiklit...</span>
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

            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>📅 {new Date(article.published_at || article.created_at).toLocaleDateString('et-EE')}</span>
              {article.author_name && (
                <span>👤 {article.author_name}</span>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              <div 
                className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-slate-400">Artiklit ei leitud</span>
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
    cover_image_url?: string
    created_at: string
    content: string
  }
  onClick: () => void
}

function CompactNewsCard({ article, onClick }: CompactNewsCardProps) {
  const excerpt = article.content.length > 80 
    ? article.content.substring(0, 80) + '...'
    : article.content

  const timeAgoText = timeAgo(new Date(article.created_at))

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 hover:border-slate-700/50 transition-all duration-300"
    >
      <div className="flex space-x-3">
        {/* Small image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-700/50">
          {article.cover_image_url ? (
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
              <span className="text-lg opacity-60">📰</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
              {article.title}
            </h4>
            <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
              {timeAgoText}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
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
      {/* Compact News Section - matches your "Toeta meid" styling */}
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-white mb-6">Teated</h3>
        <div className="max-w-md mx-auto">
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all duration-300 group">
            {/* News icon header */}
            <div className="relative mb-6">

              {/* Decorative glow effect - matching your QR section */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>

            {/* Compact news list */}
            <div className="space-y-3">
              {latestNews.map((article, index) => (
                <CompactNewsCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelectedArticleId(article.id)}
                />
              ))}
            </div>

            {/* Footer text */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                Jälgi meie uusimaid uudiseid ja teateid kogukonnast.
              </p>
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