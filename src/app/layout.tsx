// src/app/layout.tsx - Updated with Dancing Script font and metadata
import { Inter, Dancing_Script } from 'next/font/google'
import { Metadata } from 'next'
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

// Metadata for SEO and browser display
export const metadata: Metadata = {
  title: 'LegendRix E-Spordikeskus',
  description: 'LegendRix E-Spordikeskus - Eesti juhtiv e-spordi keskkond',
  keywords: 'e-sport, esport, gaming, LegendRix, Eesti, Estonia, mängud, võistlused',
  authors: [{ name: 'LegendRix' }],
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/favicon-32x32.png',
  },
  openGraph: {
    title: 'LegendRix E-Spordikeskus',
    description: 'Eesti juhtiv e-spordi keskkond - liitu meiega!',
    url: 'https://legendrix.ee',
    siteName: 'LegendRix E-Spordikeskus',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LegendRix E-Spordikeskus'
      }
    ],
    locale: 'et_EE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegendRix E-Spordikeskus',
    description: 'Eesti juhtiv e-spordi keskkond',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

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