// src/hooks/news/index.ts
// Export all news-related hooks from one place

// Query hooks
export {
  usePublicLatestNews,
  useNewsArticle,
  useAllNewsArticles,
  useFilteredNewsArticles,
  useNewsStats,
  newsKeys
} from './useNewsQueries'

// Mutation hooks
export {
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  useBulkUpdateNews,
  useBulkDeleteNews
} from './useNewsMutations'

// Types are available from main types index: @/types