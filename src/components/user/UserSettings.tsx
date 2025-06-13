// src/components/user/UserSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

// Types for form data
interface AccountFormData {
  name: string
  player_name: string
  email: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type SettingsSection = 'account' | 'password' | 'preferences'

interface Message {
  type: 'success' | 'error'
  text: string
}

export function UserSettings() {
  const { user, loading: authLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<SettingsSection>('account')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  // Account form
  const accountForm = useForm<AccountFormData>({
    defaultValues: {
      name: '',
      player_name: '',
      email: ''
    }
  })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      accountForm.reset({
        name: user.name || '',
        player_name: user.player_name || '',
        email: user.email || ''
      })
    }
  }, [user, accountForm])

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleAccountUpdate = async (data: AccountFormData) => {
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      console.log('🔄 Updating account info:', {
        userId: user.id,
        name: data.name,
        player_name: data.player_name,
        email: data.email
      })

      // Update user profile in database
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: data.name.trim(),
          player_name: data.player_name.trim(),
          email: data.email.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (dbError) {
        console.error('❌ Database update error:', dbError)
        setMessage({
          type: 'error',
          text: 'Failed to update account information. Please try again.'
        })
        return
      }

      // If email changed, update Supabase auth email
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email
        })

        if (authError) {
          console.error('❌ Auth email update error:', authError)
          setMessage({
            type: 'error',
            text: 'Account updated, but email change requires verification. Check your new email.'
          })
          return
        }
      }

      console.log('✅ Account updated successfully')
      setMessage({
        type: 'success',
        text: 'Account information updated successfully!'
      })

      // Refresh the page to get updated user data
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('❌ Account update error:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred while updating your account.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    if (!user) return

    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match.'
      })
      return
    }

    // Validate password strength
    if (data.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.'
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      console.log('🔄 Updating password for user:', user.id)

      // Update password in Supabase auth
      const { error: authError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (authError) {
        console.error('❌ Password update error:', authError)
        setMessage({
          type: 'error',
          text: authError.message || 'Failed to update password. Please try again.'
        })
        return
      }

      console.log('✅ Password updated successfully')
      setMessage({
        type: 'success',
        text: 'Password updated successfully!'
      })

      // Clear password form
      passwordForm.reset()

    } catch (error) {
      console.error('❌ Password update error:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred while updating your password.'
      })
    } finally {
      setLoading(false)
    }
  }

  const settingsSections = [
    {
      id: 'account' as SettingsSection,
      icon: '👤',
      title: 'Account Information',
      description: 'Update your name, player name, and email'
    },
    {
      id: 'password' as SettingsSection,
      icon: '🔐',
      title: 'Password & Security',
      description: 'Change your password and security settings'
    },
    {
      id: 'preferences' as SettingsSection,
      icon: '⚙️',
      title: 'Preferences',
      description: 'Customize your experience'
    }
  ]

  const renderAccountSection = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Account Information</h3>
      <form onSubmit={accountForm.handleSubmit(handleAccountUpdate)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
            Full Name
          </label>
          <input
            {...accountForm.register('name', { required: 'Name is required' })}
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Enter your full name"
          />
          {accountForm.formState.errors.name && (
            <p className="text-red-400 text-sm mt-1">{accountForm.formState.errors.name.message}</p>
          )}
        </div>

        {/* Player Name Field */}
        <div>
          <label htmlFor="player_name" className="block text-sm font-medium text-slate-300 mb-2">
            Player Name
          </label>
          <input
            {...accountForm.register('player_name', { required: 'Player name is required' })}
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Enter your racing alias"
          />
          {accountForm.formState.errors.player_name && (
            <p className="text-red-400 text-sm mt-1">{accountForm.formState.errors.player_name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <input
            {...accountForm.register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            })}
            type="email"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Enter your email address"
          />
          {accountForm.formState.errors.email && (
            <p className="text-red-400 text-sm mt-1">{accountForm.formState.errors.email.message}</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  )

  const renderPasswordSection = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Password & Security</h3>
      <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
        {/* Current Password Field - Optional for now */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Current Password <span className="text-slate-500">(optional)</span>
          </label>
          <input
            {...passwordForm.register('currentPassword')}
            type="password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Enter your current password"
          />
        </div>

        {/* New Password Field */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
            New Password
          </label>
          <input
            {...passwordForm.register('newPassword', { 
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters long'
              }
            })}
            type="password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Enter your new password"
          />
          {passwordForm.formState.errors.newPassword && (
            <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
            Confirm New Password
          </label>
          <input
            {...passwordForm.register('confirmPassword', { 
              required: 'Please confirm your new password'
            })}
            type="password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
            placeholder="Confirm your new password"
          />
          {passwordForm.formState.errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Update Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </form>
    </div>
  )

  const renderPreferencesSection = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-6">Preferences</h3>
      <div className="space-y-6">
        {/* Coming Soon Message */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚧</span>
          </div>
          <h4 className="text-xl font-semibold text-white mb-2">Coming Soon</h4>
          <p className="text-slate-400">
            Personalization options and preferences will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSection()
      case 'password':
        return renderPasswordSection()
      case 'preferences':
        return renderPreferencesSection()
      default:
        return renderAccountSection()
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400">Please log in to access settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">User Settings</h1>
          <p className="text-xl text-slate-300 drop-shadow-lg">
            Manage your account information and preferences
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-200 group
                      ${activeSection === section.id
                        ? 'bg-blue-600/20 border-blue-400/40 text-blue-300'
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        {section.icon}
                      </span>
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs text-slate-500">{section.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              {/* Message */}
              {message && (
                <div className={`
                  mb-6 p-4 rounded-xl border
                  ${message.type === 'success'
                    ? 'bg-green-900/50 border-green-700/50 text-green-300'
                    : 'bg-red-900/50 border-red-700/50 text-red-300'
                  }
                `}>
                  <div className="flex items-center space-x-2">
                    <span>{message.type === 'success' ? '✅' : '❌'}</span>
                    <span>{message.text}</span>
                  </div>
                </div>
              )}

              {/* Active Section Content */}
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
