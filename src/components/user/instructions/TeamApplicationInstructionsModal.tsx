// src/components/user/instructions/TeamApplicationInstructionsModal.tsx
'use client'

import { useEffect } from 'react'
import { ModalProps } from '@/types'
import Image from 'next/image'

interface TeamApplicationInstructionsModalProps extends Pick<ModalProps, 'isOpen' | 'onClose'> {}

export function TeamApplicationInstructionsModal({ isOpen, onClose }: TeamApplicationInstructionsModalProps) {
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
              Tiimidesse kandideerimine
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
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <p className="text-gray-300 leading-relaxed">
                  Selleks, et kandideerida ja saada tiimi pead esmalt minema tiimide leheküljele. Sinna saad minna läbi töölaual oleva kiirmenüü nuppude valides "Tiimid" või avad paremalt ülevalt nurgast rippmenüü ja valid sealt "Tiimid".
                </p>
              </div>
            </div>

            {/* Step 1 - Finding a Team */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600/30 to-yellow-600/20 flex items-center justify-center border border-orange-500/50">
                  <span className="text-white font-bold font-['Orbitron']">1</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Tiimi valimine
                </h3>
              </div>
              
              <p className="text-gray-300 leading-relaxed pl-13">
                Seejärel oled jõudnud tiimide lehel, kus on tabelis kuvatud kõikide tiimide nimistu, koos tiimipealiku nime, vabade kohtadega ja nupuga "Kandideeri".
              </p>

              <p className="text-gray-300 leading-relaxed pl-13">
                Kui oled leidnud omale sobiva tiimi siis vajuta nupule kandideeri (Vaata allolevat fotot).
              </p>

              {/* Image 1 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent"></div>
                <Image
                  src="/images/instructions/ValiSobivTiim.png"
                  alt="Vali sobiv tiim"
                  width={800}
                  height={400}
                  className="w-full h-auto relative z-10"
                  priority
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"></div>

            {/* Step 2 - Application Form */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600/30 to-green-600/20 flex items-center justify-center border border-yellow-500/50">
                  <span className="text-white font-bold font-['Orbitron']">2</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Kandideerimine
                </h3>
              </div>

              <p className="text-gray-300 leading-relaxed pl-13">
                Seejärel avaneb uus aken, kus on kirjas tiimi info ja sinna kuuluvad liikmed. Selleks, et valitud tiimi kandideerida pead kinnitama esmalt reeglitega tutvumist ja siis aktiveerub nupp "Saada taotlus" kuhu peale vajutades oled avaldanud soovi kandideerida tiimi. (Vaata allolevalt fotolt).
              </p>

              <div className="relative bg-red-900/10 border border-red-500/30 rounded-lg p-3 pl-13">
                <p className="text-red-400 text-sm font-medium">
                  <span className="font-bold">NB!</span> Tiimi kandideerimine ei garanteeri, et tiimi pealik kinnitab sinu taotluse.
                </p>
              </div>

              {/* Image 2 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent"></div>
                <Image
                  src="/images/instructions/KandideerimisVorm.png"
                  alt="Kandideerimis vorm"
                  width={800}
                  height={400}
                  className="w-full h-auto relative z-10"
                />
              </div>
            </div>

            {/* Step 3 - Checking Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600/30 to-blue-600/20 flex items-center justify-center border border-green-500/50">
                  <span className="text-white font-bold font-['Orbitron']">3</span>
                </div>
                <h3 className="text-lg font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                  Staatuse kontrollimine
                </h3>
              </div>

              <p className="text-gray-300 leading-relaxed pl-13">
                Selleks, et saada teada, kas oled saanud tiimi, pead jälgima aeg-ajalt oma tiimi lehekülge, minnes uuesti läbi kiirmenüü nuppude "Tiimid" või valides paremalt ülevalt rippmenüüst "Tiimid". Kui oled edukalt saanud tiimi siis peab avanema alljärgnev leht (Vaata allolevat fotot).
              </p>

              {/* Image 3 */}
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent"></div>
                <Image
                  src="/images/instructions/OledValitudTiimi.png"
                  alt="Oled valitud tiimi"
                  width={800}
                  height={400}
                  className="w-full h-auto relative z-10"
                />
              </div>
            </div>

            {/* Team Member Obligations */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-magenta-600/20 to-purple-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="space-y-3">
                  <h4 className="text-base font-black font-['Orbitron'] text-white uppercase tracking-wide">
                    Kui oled valitud tiimi siis kaasnevad sellega ka kohustused:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Tiimi liikmena pead alati võistlustel valima endale sõiduki, mis on tiimile määratud (Teiste sõidukitega sõitmine on keelatud ja tulemusi ei arvestata)
                      </p>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Tiimi liikmena pead alati ka jälgima, et oled registreerunud õigesse võistlusklassi, mis on ka tiimile määratud. Igas võistlusklassis on erinevad tiimid ja need ei kattu. Olles registreerunud end tiimist erinevasse võistlusklassi, siis sinu tulemusi ei arvestata.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Leaving the Team */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg blur-lg opacity-50"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-500/50 flex-shrink-0 mt-0.5">
                    <span className="text-red-400">!</span>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold font-['Orbitron'] text-white uppercase tracking-wide">
                      Tiimist lahkumine
                    </h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      Kui on soov tiimist lahkuda, tuleb vastavasisuline kiri saata oma tiimi pealikule, sest ainult tiimi pealik saab enda tiimi liikmeid tiimist eemaldada. Kui tiimi pealik on sinu eemaldamise taotluse teinud administraatoritele, siis administraator kinnitab või lükkab taotluse tagasi üldiselt 24-48 tunni jooksul.
                    </p>
                    <p className="text-gray-400 italic leading-relaxed text-xs">
                      Administraatori kinnitus tiimist eemaldamiseks on vajalik, et vältida tiimisiseseid konflikte või tiimipealiku pahatahtliku käitumist oma tiimikaaslaste osas - see lihtsalt on lisa kaitse ka tiimi liikmete osas, kuid enamasti ei ole tegu pahatahtliku eemaldamisega ja tiimis osalemine ei ole kohustus.
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