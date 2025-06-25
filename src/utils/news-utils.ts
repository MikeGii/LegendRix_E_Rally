// src/utils/news-utils.ts
export const formatDateEstonian = (dateString: string, includeTime: boolean = false) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }
  
  return date.toLocaleDateString('et-EE', options)
}

export const formatDateShortEstonian = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('et-EE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const timeAgo = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}p`
  return `${Math.floor(diffInSeconds / 2592000)}k`
}

// Strip HTML tags from content
export const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return html.replace(/<[^>]*>/g, '')
  }
  
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const truncateText = (text: string, maxLength: number): string => {
  // First strip any HTML if present
  const plainText = stripHtml(text)
  return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText
}

export const getNewsStatusBadge = (news: { is_published: boolean; is_featured: boolean }) => {
  if (!news.is_published) {
    return {
      label: 'Mustand',
      className: 'px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-medium'
    }
  }
  if (news.is_featured) {
    return {
      label: 'Esiletõstetud',
      className: 'px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium'
    }
  }
  return {
    label: 'Avaldatud',
    className: 'px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium'
  }
}

export const validateNewsForm = (formData: {
  title: string
  content: string
  cover_image_url?: string
}) => {
  const errors: Record<string, string> = {}

  if (!formData.title.trim()) {
    errors.title = 'Pealkiri on kohustuslik'
  } else if (formData.title.length > 255) {
    errors.title = 'Pealkiri ei tohi olla pikem kui 255 tähemärki'
  }

  if (!formData.content.trim()) {
    errors.content = 'Sisu on kohustuslik'
  }

  if (formData.cover_image_url && !isValidUrl(formData.cover_image_url)) {
    errors.cover_image_url = 'Palun sisesta kehtiv URL'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

const isValidUrl = (url: string): boolean => {
  if (!url) return true
  if (url.startsWith('/')) return true
  
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const generateExcerpt = (content: string, maxLength: number = 120): string => {
  // Remove any HTML tags and get plain text
  const plainText = stripHtml(content)
  return truncateText(plainText, maxLength)
}

export const getReadingTime = (content: string): number => {
  const wordsPerMinute = 200
  const plainText = stripHtml(content)
  const words = plainText.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}