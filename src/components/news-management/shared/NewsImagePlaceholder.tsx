// src/components/news-management/shared/NewsImagePlaceholder.tsx
interface NewsImagePlaceholderProps {
  title: string
  className?: string
}

export function NewsImagePlaceholder({ title, className = "w-full h-full" }: NewsImagePlaceholderProps) {
  return (
    <div className={`bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center ${className}`}>
      <span className="text-lg opacity-60">📰</span>
    </div>
  )
}