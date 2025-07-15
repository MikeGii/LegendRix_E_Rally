// src/components/user/instructions/TeamManagementInstructionsModal.tsx
'use client'

import { useEffect } from 'react'
import { ModalProps } from '@/types'
import Image from 'next/image'

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
      <div className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] bg-black/90 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,0,64,0.3)] overflow-hidden tech-border">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-xl p-4 sm:p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black font-['Orbitron'] text-white uppercase tracking-wider">
              Tiimi manageerimine
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-modal-scrollbar max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-100px)]">
          <div className="space-y-6">
            {/* Introduction */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-magenta-600/20 to-purple-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <p className="text-gray-300 leading-relaxed">
                  Tiimi pealikuna on sul oluline roll võistkonna juhtimisel ja haldamisel. Siin juhendis on kirjeldatud kõik vajalikud funktsioonid ja kohustused, mis kaasnevad tiimi juhtimisega.
                </p>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/50 flex-shrink-0 mt-0.5">
                    <span className="text-red-400">!</span>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                      Eeltingimused
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Tiimi pealikuks saab määrata ainult administraator. Kui sa ei ole veel tiimi pealik, kuid soovid luua oma tiimi, võta ühendust administraatoriga.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Leader Responsibilities */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/20 flex items-center justify-center border border-purple-500/50">
                  <span className="text-white font-bold font-['Orbitron']">1</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Tiimi pealiku kohustused
                </h3>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50 space-y-3">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-0.5">▸</span>
                    <div className="space-y-1">
                      <p className="text-white font-medium">Liikmete haldamine</p>
                      <p className="text-gray-400 text-sm">
                        Võta vastu ja eemalda tiimi liikmeid. Jälgi, et kõik liikmed võistlevad tiimile määratud võistlusklassis.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-0.5">▸</span>
                    <div className="space-y-1">
                      <p className="text-white font-medium">Sõiduki järelevalve</p>
                      <p className="text-gray-400 text-sm">
                        Kontrolli, et kõik tiimi liikmed kasutavad tiimile määratud sõidukit. Sõiduki tootmisaasta ei ole määratud.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400 mt-0.5">▸</span>
                    <div className="space-y-1">
                      <p className="text-white font-medium">Tiimi suurus</p>
                      <p className="text-gray-400 text-sm">
                        Hoia tiimi suurus vahemikus 3-5 liiget (sina kaasa arvatud).
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Managing Team Members */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600/30 to-yellow-600/20 flex items-center justify-center border border-orange-500/50">
                  <span className="text-white font-bold font-['Orbitron']">2</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Liikmete vastuvõtmine
                </h3>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Kui keegi on kandideerinud sinu tiimi, saad tema taotluse vastu võtta või tagasi lükata tiimide lehel.
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-orange-400 uppercase">Enne liikmete vastuvõttu kontrolli:</p>
                    <ul className="space-y-2 pl-4">
                      <li className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        Kas kandidaat on registreeritud õigesse võistlusklassi
                      </li>
                      <li className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">•</span>
                        Kas kandidaat on valmis kasutama tiimi sõidukit
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Removing Team Members */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/30 to-orange-600/20 flex items-center justify-center border border-red-500/50">
                  <span className="text-white font-bold font-['Orbitron']">3</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Liikmete eemaldamine
                </h3>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50 space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  Tiimi pealikuna on sul õigus eemaldada liikmeid oma tiimist. Eemaldamiseks vajuta punasele ristile tiimi liikme nime järgi tiimi lehel. Liikmete eemaldamine vajab administraatori kinnitust.
                </p>
                
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    <span className="font-bold">NB!</span> Administraatori kinnituse nõue on selleks, et vältida pahatahtlikku käitumist ja kaitsta tiimi liikmeid.
                  </p>
                </div>

                <p className="text-gray-400 text-sm italic">
                  Tavaliselt kinnitab administraator eemaldamistaotluse 24-48 tunni jooksul.
                </p>
              </div>
            </div>

            {/* Team Performance */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600/30 to-blue-600/20 flex items-center justify-center border border-green-500/50">
                  <span className="text-white font-bold font-['Orbitron']">4</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Tiimi tulemused
                </h3>
              </div>

              <div className="bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    Tiimi punktid arvutatakse individuaalsõitude põhjal. Eraldi tiimisõite ei toimu.
                  </p>
                  
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-3 border border-green-500/30">
                    <p className="text-green-400 text-sm font-medium">
                      Igal üritusel lähevad arvesse kolme parima tiimi liikme ajad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}