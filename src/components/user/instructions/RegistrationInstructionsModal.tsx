// src/components/user/instructions/RegistrationInstructionsModal.tsx
'use client'

import { useEffect } from 'react'
import { ModalProps } from '@/types'
import Image from 'next/image'

interface RegistrationInstructionsModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {}

export function RegistrationInstructionsModal({ isOpen, onClose }: RegistrationInstructionsModalProps) {
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
              Võistlustele registreerimine
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
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <p className="text-gray-300 leading-relaxed">
                  Rallidele saab registreeruda läbi kasutaja töölaua. Selleks on kokku olemas 2 erinevat võimalust, mis lõpuks viivad ühele ja samale registreeringu vormile.
                </p>
              </div>
            </div>

            {/* Method 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/30 to-orange-600/20 flex items-center justify-center border border-red-500/50">
                  <span className="text-white font-bold font-['Orbitron']">1</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Otse läbi töölaua
                </h3>
              </div>
              
              <p className="text-gray-300 leading-relaxed pl-13">
                Esmalt on võimalik rallile registreeruda otse läbi töölaua kasutades selleks "Tulevased Võistlused" sektsioonis kuvatavaid rallisid, kus on kirjas kogu lühiinfo tulevase ralli kohta. Kui oled leidnud endale ralli, kus sinule vastav võistlusklass ja formaat on sobiv, siis saad registreeruda selleks vajutades rohelist nuppu, kus on kirjas "Registreeri" (vaata allolevalt fotolt).
              </p>

              {/* Image 1 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent"></div>
                <Image
                  src="/images/instructions/TulevasedRallidRegistreeriNupp.png"
                  alt="Tulevased rallid registreeri nupp"
                  width={800}
                  height={400}
                  className="w-full h-auto relative z-10"
                  priority
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>

            {/* Method 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600/30 to-yellow-600/20 flex items-center justify-center border border-orange-500/50">
                  <span className="text-white font-bold font-['Orbitron']">2</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Läbi rallide lehe
                </h3>
              </div>

              <p className="text-gray-300 leading-relaxed pl-13">
                Samuti on võimalik rallile registreeruda läbi rallide lehe vajutades selleks kiirmenüüst töölaual "Rallid" või valides paremalt ülevalt rippmenüüst "Registreeri rallile".
              </p>

              <p className="text-gray-300 leading-relaxed pl-13">
                Sellisel juhul avaneb uus lehekülg, kus on näha kõik tulevased rallid ja kui oled valinud omale sobiva ralli siis klikka selle peale, et minna edasi registreerimisvormile. (vaata allolevalt fotolt).
              </p>

              {/* Image 2 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent"></div>
                <Image
                  src="/images/instructions/ValiSobivRalli.png"
                  alt="Vali sobiv ralli"
                  width={800}
                  height={400}
                  className="w-full h-auto relative z-10"
                />
              </div>
            </div>

            {/* Registration Form Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600/30 to-green-600/20 flex items-center justify-center border border-yellow-500/50">
                  <span className="text-white font-bold font-['Orbitron']">3</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Registreerimisvorm
                </h3>
              </div>

              <p className="text-gray-300 leading-relaxed pl-13">
                Kui oled jõudnud registreerimisvormile, siis seal on kuvatud kogu info antud ralli kohta. Palun kontrolli veelkord, et kõik kriteeriumid vastavad sinu nõuetele (võistlusklass, eritingimused, jne...).
              </p>

              <p className="text-gray-300 leading-relaxed pl-13">
                Seejärel vali omale vastav klass, milles soovid osaleda. (Mõnikord ongi saadaval ainult üks klass - näiteks tiitlivõistlused, kus iga klass võistleb eraldi ajal). Siis pead kinnitama, et oled reeglitega tutvunud ja seejärel tekib alles võimalus rallile registreeruda kui "Registreeru nüüd" nupp läheb aktiivseks (punaseks).
              </p>

              {/* Image 3 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent"></div>
                <Image
                  src="/images/instructions/ValiKlassJaRegistreeru.png"
                  alt="Vali klass ja registreeru"
                  width={800}
                  height={400}
                  className="w-full h-auto relative z-10"
                />
              </div>
            </div>

            {/* Cancellation Info */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-magenta-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/50 flex-shrink-0 mt-0.5">
                    <span className="text-red-400">!</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Orbitron'] text-white uppercase tracking-wide mb-2">
                      Registreeringu tühistamine
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Kui aga tekib olukord, et oled ennast registreerunud rallile ja ei saa paraku osaleda, siis registreeringu tühistamine on imelihtne ja seda saab teha vajutades töölaual "Tulevased Rallid" sektsioonis registreeritud ralli järel punast nuppu "Tühista" või mine läbi rallide lehekülje uuesti registreerimisvormile ja vajuta sealt "Tühista registreering".
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