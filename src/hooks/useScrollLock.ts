// src/hooks/useScrollLock.ts
import { useEffect } from 'react'

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return

    // Save current scroll position
    const scrollY = window.scrollY

    // Lock scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    // Cleanup function
    return () => {
      // Restore scroll
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      
      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
  }, [isLocked])
}