export const trackQueryPerformance = (queryName: string, duration: number) => {
  console.log(`Query ${queryName} took ${duration}ms`)
  
  if (duration > 1000) {
    console.warn(`Slow query detected: ${queryName} (${duration}ms)`)
  }
  
  // You can integrate with analytics services here
  // Example: analytics.track('slow_query', { name: queryName, duration })
}

export const trackError = (operation: string, error: any) => {
  console.error(`Operation ${operation} failed:`, error)
  
  // You can integrate with error tracking here
  // Example: Sentry.captureException(error, { tags: { operation } })
}