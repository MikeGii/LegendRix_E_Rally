// src/components/user/UserActionPrompt.tsx
interface UserActionPromptProps {
  canAccessRallies: boolean
  emailVerified: boolean
}

export function UserActionPrompt({ canAccessRallies, emailVerified }: UserActionPromptProps) {
  if (canAccessRallies) return null

  return (
    <div className="mt-8 text-center">
      {!emailVerified ? (
        <button className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-yellow-500/25">
          <div className="flex items-center space-x-2">
            <span>📧</span>
            <span>Resend Verification Email</span>
          </div>
        </button>
      ) : (
        <div className="bg-slate-700/30 rounded-xl p-4">
          <p className="text-slate-300">
            Your account is under review. You'll receive an email notification once approved.
          </p>
        </div>
      )}
    </div>
  )
}