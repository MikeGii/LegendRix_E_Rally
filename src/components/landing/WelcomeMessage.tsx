// src/components/landing/WelcomeMessage.tsx
'use client'

interface User {
  id: string
  name: string
  email: string
  role: string
  // Make updated_at optional since it might not always be present
  updated_at?: string
}

interface WelcomeMessageProps {
  user: User | null
}

export function WelcomeMessage({ user }: WelcomeMessageProps) {
  if (!user) return null

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Tere tulemast tagasi, {user.name}! 🎉
        </h3>
        <p className="text-green-300">
          Olete edukalt sisse logitud. Alustage oma rally teekonda!
        </p>
      </div>
    </div>
  )
}