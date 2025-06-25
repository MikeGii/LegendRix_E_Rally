// src/components/news-management/shared/NewsStatusBadge.tsx
import { getNewsStatusBadge } from '@/utils/news-utils'

interface NewsStatusBadgeProps {
  isPublished: boolean
  isFeatured: boolean
}

export function NewsStatusBadge({ isPublished, isFeatured }: NewsStatusBadgeProps) {
  const { label, className } = getNewsStatusBadge({ 
    is_published: isPublished, 
    is_featured: isFeatured 
  })

  return <span className={className}>{label}</span>
}