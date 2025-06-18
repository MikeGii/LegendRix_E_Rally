// src/components/landing/sections/NewsSection.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePublicLatestNews, useNewsArticle } from '@/hooks/useNewsManagement'
import { Modal } from '@/components/ui/Modal'

// Simple time ago function to replace date-fns
function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutit tagasi`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} tundi tagasi`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} päeva tagasi`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} kuud tagasi`
  return `${Math.floor(diffInSeconds / 31536000)} aastat tagasi`
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
            {/* Cover Image */}
            {article.cover_image_url && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <Image
                  src={article.cover_image_url}
                  alt={article.cover_image_alt || article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}

            {/* Article Meta */}
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>📅 {new Date(article.published_at || article.created_at).toLocaleDateString('et-EE')}</span>
              {article.author_name && (
                <span>👤 {article.author_name}</span>
              )}
            </div>

            {/* Article Content */}
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

interface NewsCardProps {
  article: {
    id: string
    title: string
    cover_image_url?: string
    created_at: string
    content: string
  }
  onClick: () => void
}

function NewsCard({ article, onClick }: NewsCardProps) {
  // Create excerpt from content (first 100 characters)
  const excerpt = article.content.length > 100 
    ? article.content.substring(0, 100) + '...'
    : article.content

  const timeAgoText = timeAgo(new Date(article.created_at))

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:bg-slate-800/40 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {article.cover_image_url ? (
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
            <span className="text-6xl opacity-50">📰</span>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Date Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white border border-white/20">
          {timeAgoText}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>
        
        <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Read More Indicator */}
        <div className="mt-4 flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
          <span>Loe edasi</span>
          <svg 
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export function NewsSection() {
  const { data: latestNews = [], isLoading } = usePublicLatestNews(3)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-900 to-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Uudised</h2>
            <p className="text-slate-400 text-lg">Värskeid uudiseid ja teateid</p>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-slate-400">Laen uudiseid...</span>
          </div>
        </div>
      </section>
    )
  }

  // Don't render section if no news
  if (latestNews.length === 0) {
    return null
  }

  return (
    <>
      <section className="py-24 bg-gradient-to-b from-slate-900 to-black">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6">
              <span className="text-blue-400">📰</span>
              <span className="text-blue-400 font-medium">Uudised</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Värskeid Uudiseid
            </h2>
            
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Jälgi kõiki olulisi teateid ja uudiseid meie rallimaailmast
            </p>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={() => setSelectedArticleId(article.id)}
              />
            ))}
          </div>

          {/* Call to Action - if there are more articles */}
          {latestNews.length === 3 && (
            <div className="text-center mt-12">
              <p className="text-slate-400 mb-4">Rohkem uudiseid tulekul...</p>
            </div>
          )}
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