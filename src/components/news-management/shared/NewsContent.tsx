// src/components/news-management/shared/NewsContent.tsx
import React from 'react'

interface NewsContentProps {
  content: string
  truncate?: boolean
  maxLines?: number
  className?: string
}

export function NewsContent({ content, truncate = false, maxLines = 3, className = '' }: NewsContentProps) {
  // Add base classes plus any custom classes
  const contentClasses = `
    news-content quill-content
    ${truncate ? `line-clamp-${maxLines}` : ''}
    ${className}
  `.trim()

  // Safely render the HTML content
  return (
    <div 
      className={contentClasses}
      dangerouslySetInnerHTML={{ __html: content || '<p>Sisu puudub</p>' }}
    />
  )
}

export default NewsContent