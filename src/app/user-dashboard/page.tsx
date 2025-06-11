// src/components/UserDashboard.tsx
'use client'

import { useAuth } from '@/components/AuthProvider'

export function UserDashboard() {
  const { user, logout } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  // Check user status and show appropriate interface
  const isFullyApproved = user.email_verified && user.admin_approved && user.status === 'approved'
  const needsEmailVerification = !user.email_verified
  const needsAdminApproval = user.email_verified && !user.admin_approved

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {user.name}!</h1>
              <p className="text-slate-400">Role: {user.role} | Status: {user.status}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Status-based content */}
        {needsEmailVerification && (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📧</span>
              </div>
              <div className="flex-1">
                <h3 className="text-yellow-300 font-semibold">Email Verification Required</h3>
                <p className="text-yellow-200">Please check your email and verify your account to continue.</p>
              </div>
              <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
                Resend Email
              </button>
            </div>
          </div>
        )}

        {needsAdminApproval && (
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="flex-1">
                <h3 className="text-blue-300 font-semibold">Pending Admin Approval</h3>
                <p className="text-blue-200">Your account is under review. You'll receive an email notification once approved.</p>
              </div>
            </div>
          </div>
        )}

        {isFullyApproved ? (
          // Full dashboard for approved users
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h3 className="text-green-300 font-semibold">Account Approved!</h3>
                  <p className="text-green-200">You now have full access to all rally features.</p>
                </div>
              </div>
            </div>

            {/* Rally Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">🏁 Register for Rally</h3>
                <p className="text-slate-300 mb-4">Join upcoming championships and compete with drivers worldwide.</p>
                <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200">
                  Browse Rallies
                </button>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">📊 Results & Stats</h3>
                <p className="text-slate-300 mb-4">View championship results, rankings, and your performance history.</p>
                <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                  View Results
                </button>
              </div>
            </div>

            {/* Upcoming Rallies */}
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Upcoming Rallies</h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏁</span>
                </div>
                <p className="text-slate-400">No upcoming rallies at the moment.</p>
                <p className="text-slate-500 text-sm">Check back soon for new events!</p>
              </div>
            </div>
          </div>
        ) : (
          // Limited dashboard for non-approved users
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Access Restricted</h3>
              <p className="text-slate-400 mb-6">
                Rally features will be available once your account is fully verified and approved.
              </p>
              
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center justify-center space-x-2">
                  <span className={user.email_verified ? "text-green-400" : "text-yellow-400"}>
                    {user.email_verified ? "✅" : "⏳"}
                  </span>
                  <span>Email Verification</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className={user.admin_approved ? "text-green-400" : "text-yellow-400"}>
                    {user.admin_approved ? "✅" : "⏳"}
                  </span>
                  <span>Admin Approval</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="mt-6 bg-slate-800/20 backdrop-blur-xl rounded-xl border border-slate-700/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Email:</span>
              <span className="text-white ml-2">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-400">Role:</span>
              <span className="text-white ml-2">{user.role}</span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>
              <span className="text-white ml-2">{user.status}</span>
            </div>
            <div>
              <span className="text-slate-400">Member since:</span>
              <span className="text-white ml-2">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}