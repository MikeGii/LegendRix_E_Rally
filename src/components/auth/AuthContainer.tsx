import React from 'react'

export default function AuthContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/30">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500 text-xs font-mono border border-gray-800">
              LOGO
              <br />
              .png
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}