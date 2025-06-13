// src/app/layout.tsx - Fixed layout with ViewProvider restored
'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ViewProvider } from '@/components/ViewProvider'
import { QueryProvider } from '@/components/QueryProvider'
import { ProfileCompletionWrapper } from '@/components/auth/ProfileCompletionWrapper'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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