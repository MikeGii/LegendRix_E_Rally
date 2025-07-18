'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AdminPageHeader } from '@/components/shared/AdminPageHeader'
import { ProductFormModal } from '@/components/products/ProductFormModal'

export default function ProductDashboardPage() {
  console.log('🛍️ ProductDashboardPage - Component loaded')
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 grid-pattern opacity-[0.02]"></div>
            <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-40 right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse" 
              style={{ animationDelay: '2s' }}></div>
            <div className="scan-line"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
            <AdminPageHeader
              title="Fännikaubad"
              description="Halda fännikaupu ja nende müügit"
              icon="🛍️"
            />

            {/* Add Product Button */}
            <div className="mb-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="group flex items-center space-x-3 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 
                         text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 
                         backdrop-blur-sm border border-red-500/30 hover:border-red-400/50 
                         hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transform hover:scale-[1.02]"
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">➕</span>
                <span className="font-['Orbitron'] font-medium">Lisa Uus Toode</span>
              </button>
            </div>

            {/* Content will be added later */}
            <div className="tech-border rounded-2xl shadow-[0_0_30px_rgba(255,0,64,0.1)] bg-black/80 backdrop-blur-xl p-6">
              <p className="text-gray-400 text-center py-8">
                Fännikaupade haldus tuleb peagi...
              </p>
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        <ProductFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  )
}