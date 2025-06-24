// src/app/layout.tsx - Updated with Dancing Script font
'use client'

import { Inter, Dancing_Script } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ViewProvider } from '@/components/ViewProvider'
import { QueryProvider } from '@/components/QueryProvider'
import { ProfileCompletionWrapper } from '@/components/auth/ProfileCompletionWrapper'

// Inter for main text
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

// Dancing Script for supporter names
const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dancing-script',
  display: 'swap', // Improves loading performance
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dancingScript.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ViewProvider>
              <ProfileCompletionWrapper>
                {children}
              </ProfileCompletionWrapper>
            </ViewProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}