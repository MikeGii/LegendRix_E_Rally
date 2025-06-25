// src/components/news-management/shared/NewsCard.tsx - COMPLETE VERSION
import { NewsArticle } from '@/types/index'
import { formatDateEstonian, truncateText, timeAgo } from '@/utils/news-utils'
import { NewsStatusBadge } from './NewsStatusBadge'
import { NewsImagePlaceholder } from './NewsImagePlaceholder'

interface NewsCardProps {
  news: NewsArticle
  onEdit?: (news: NewsArticle) => void
  onDelete?: (newsId: string) => void
  onClick?: (news: NewsArticle) => void
  variant?: 'admin' | 'public' | 'compact'
}

export function NewsCard({ news, onEdit, onDelete, onClick, variant = 'public' }: NewsCardProps) {
  const handleClick = () => {
    if (onClick) onClick(news)
  }

  if (variant === 'compact') {
    const timeAgoText = timeAgo(new Date(news.created_at))

    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer bg-slate-900/30 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-4 hover:border-slate-700/50 transition-all duration-300"
      >
        <div className="flex space-x-3">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-700/50">
            {news.cover_image_url ? (
              <img
                src={news.cover_image_url}
                alt={news.cover_image_alt || news.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <NewsImagePlaceholder title={news.title} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                {news.title}
              </h4>
              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                {timeAgoText}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {truncateText(news.content, 80)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'admin') {
    return (
      <tr className="hover:bg-slate-700/20 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {news.cover_image_url ? (
              <img
                src={news.cover_image_url}
                alt={news.cover_image_alt || ''}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <NewsImagePlaceholder title={news.title} className="w-full h-full" />
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-white">
                {news.title}
              </div>
              <div className="text-sm text-slate-400 line-clamp-1">
                {truncateText(news.content, 80)}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <NewsStatusBadge 
            isPublished={news.is_published} 
            isFeatured={news.is_featured} 
          />
        </td>
        <td className="px-6 py-4 text-sm text-slate-300">
          {formatDateEstonian(news.created_at, true)}
        </td>
        <td className="px-6 py-4 text-sm text-slate-300">
          {news.author_name || 'Tundmatu'}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(news)}
                className="text-blue-400 hover:text-blue-300 p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                title="Redigeeri"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(news.id)}
                className="text-red-400 hover:text-red-300 p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                title="Kustuta"
              >
                🗑️
              </button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  // Default public variant
  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        {news.cover_image_url ? (
          <img
            src={news.cover_image_url}
            alt={news.cover_image_alt || news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <NewsImagePlaceholder title={news.title} className="w-full h-48" />
        )}
        {news.is_featured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
              Esiletõstetud
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {news.title}
        </h3>
        <div className="text-slate-300 text-sm mb-4">
          {formatDateEstonian(news.published_at || news.created_at)} 
          {news.author_name && ` • ${news.author_name}`}
        </div>
        <p className="text-slate-300 line-clamp-3">
          {truncateText(news.content, 120)}
        </p>
      </div>
    </div>
  )
}