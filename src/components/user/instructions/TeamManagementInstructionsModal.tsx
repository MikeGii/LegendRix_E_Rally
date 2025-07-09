// src/components/user/instructions/TeamManagementInstructionsModal.tsx
'use client'

import { useEffect } from 'react'
import { ModalProps } from '@/types'

interface TeamManagementInstructionsModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {}

export function TeamManagementInstructionsModal({ isOpen, onClose }: TeamManagementInstructionsModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden tech-border">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-['Orbitron'] text-white uppercase tracking-wider">
              Tiimi manageerimine
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto custom-modal-scrollbar max-h-[calc(85vh-100px)]">
          <p className="text-gray-400">
            Juhendi sisu lisatakse hiljem...
          </p>
        </div>
      </div>
    </div>
  )
}