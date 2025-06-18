// src/components/testing/NewsFlowTester.tsx
// This is a helper component for testing the complete news flow
'use client'

import { useState } from 'react'
import { useCreateNews } from '@/hooks/useNewsManagement'

export function NewsFlowTester() {
  const [isCreating, setIsCreating] = useState(false)
  const createNewsMutation = useCreateNews()

  const createTestNews = async () => {
    setIsCreating(true)
    try {
      await createNewsMutation.mutateAsync({
        title: 'Test Uudis - Automaatselt Loodud',
        content: `See on test uudis, mis loodi automaatselt testimiseks.
        
Siin on mõned test punktid:
• Esimene punkt testimiseks
• Teine punkt kontrollimiseks  
• Kolmas punkt kinnitamiseks

Kui näed seda avalikul lehel, siis uudiste süsteem töötab korralikult!

Kuupäev: ${new Date().toLocaleDateString('et-EE')}
Kellaaeg: ${new Date().toLocaleTimeString('et-EE')}`,
        cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop', // Rally car image
        cover_image_alt: 'Test rally auto pilt',
        is_published: true,
        is_featured: false,
      })
      
      alert('✅ Test uudis on loodud! Mine avalikule lehele kontrollima.')
    } catch (error) {
      console.error('❌ Test uudise loomine ebaõnnestus:', error)
      alert('❌ Test uudise loomine ebaõnnestus. Vaata konsooli.')
    } finally {
      setIsCreating(false)
    }
  }

  const createFeaturedNews = async () => {
    setIsCreating(true)
    try {
      await createNewsMutation.mutateAsync({
        title: '🏆 Oluline Teade - Esiletõstetud Uudis',
        content: `See on esiletõstetud test uudis.
        
TÄHTIS INFORMATSIOON:
• See uudis on märgitud kui esiletõstetud
• See peaks kuvatama erilise stiiliga
• Kontrollides avalikku lehte peaks see olema hästi nähtav

Test lõpetatud: ${new Date().toLocaleString('et-EE')}`,
        cover_image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop', // Championship trophy
        cover_image_alt: 'Meistrivõistluse karikas',
        is_published: true,
        is_featured: true,
      })
      
      alert('✅ Esiletõstetud test uudis on loodud!')
    } catch (error) {
      console.error('❌ Esiletõstetud uudise loomine ebaõnnestus:', error)
      alert('❌ Esiletõstetud uudise loomine ebaõnnestus.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">🧪 Uudiste Süsteemi Test</h3>
        <p className="text-slate-400 text-sm">
          Kasuta neid nuppe testimaks kogu uudiste süsteemi (Admin → Avalik leht)
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={createTestNews}
          disabled={isCreating || createNewsMutation.isPending}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isCreating || createNewsMutation.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Loon test uudist...</span>
            </div>
          ) : (
            '📰 Loo Tavaline Test Uudis'
          )}
        </button>

        <button
          onClick={createFeaturedNews}
          disabled={isCreating || createNewsMutation.isPending}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isCreating || createNewsMutation.isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Loon esiletõstetud uudist...</span>
            </div>
          ) : (
            '⭐ Loo Esiletõstetud Test Uudis'
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
        <p className="text-slate-300 text-xs">
          <strong>Test sammud:</strong>
          <br />
          1. Vajuta üht nuppu test uudise loomiseks
          <br />
          2. Kontrolli admin paneelist (/news-management) 
          <br />
          3. Mine avalikule lehele (/) kontrollima
          <br />
          4. Vajuta uudisele avatamiseks modaal aknas
        </p>
      </div>
    </div>
  )
}