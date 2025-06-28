// src/components/user/settings/PasswordTab.tsx
'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface Message {
  type: 'success' | 'error' | 'warning'
  text: string
}

interface PasswordTabProps {
  onMessage?: (message: Message | null) => void
}

// Custom icon components to replace lucide-react
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const EyeOff = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <path d="m1 1 22 22"/>
  </svg>
)

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <circle cx="12" cy="17" r="1"/>
  </svg>
)

// Password strength checker
const calculatePasswordStrength = (password: string): number => {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const getPasswordStrengthColor = (strength: number): string => {
  if (strength <= 2) return 'from-red-500 to-red-600'
  if (strength <= 4) return 'from-orange-500 to-orange-600'
  return 'from-green-500 to-green-600'
}

const getPasswordStrengthText = (strength: number): string => {
  if (strength <= 2) return 'Nõrk'
  if (strength <= 4) return 'Keskmine'
  return 'Tugev'
}

export function PasswordTab({ onMessage }: PasswordTabProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Password form with enhanced validation
  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onChange' // Enable real-time validation
  })

  const newPassword = passwordForm.watch('newPassword')
  const passwordStrength = calculatePasswordStrength(newPassword || '')

  // Secure memory cleanup function
  const secureCleanup = useCallback(() => {
    // Clear all form fields
    passwordForm.setValue('currentPassword', '')
    passwordForm.setValue('newPassword', '')
    passwordForm.setValue('confirmPassword', '')
    passwordForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // Clear from DOM (additional security)
    const passwordInputs = document.querySelectorAll('input[type="password"]')
    passwordInputs.forEach(input => {
      const htmlInput = input as HTMLInputElement
      htmlInput.value = ''
      htmlInput.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }, [passwordForm])

  const handlePasswordUpdate = async (data: PasswordFormData) => {
    if (!user) {
      onMessage?.({
        type: 'error',
        text: 'Kasutaja ei ole sisselogitud.'
      })
      return
    }

    // Enhanced password validation
    if (data.newPassword !== data.confirmPassword) {
      onMessage?.({
        type: 'error',
        text: 'Uued paroolid ei ühti.'
      })
      return
    }

    // Check password strength
    if (passwordStrength < 4) {
      onMessage?.({
        type: 'warning',
        text: 'Valitud parool on liiga nõrk. Palun vali tugevam parool.'
      })
      return
    }

    // Check if new password is same as current
    if (data.currentPassword === data.newPassword) {
      onMessage?.({
        type: 'error',
        text: 'Uus parool peab olema erinev praegusest paroolist.'
      })
      return
    }

    setLoading(true)
    onMessage?.(null)

    try {
      console.log('🔄 Alustab parooli uuendamise protsessi kasutajale:', user.id)

      // Step 1: Verify current password by attempting to sign in
      console.log('🔐 Kontrollib praegust parooli...')
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.currentPassword
      })

      if (verifyError) {
        console.error('❌ Praeguse parooli kontroll ebaõnnestus:', verifyError.message)
        
        // Clear sensitive data immediately on failure
        secureCleanup()
        
        onMessage?.({
          type: 'error',
          text: 'Praegune parool on vale. Palun kontrolli ja proovi uuesti.'
        })
        setLoading(false)
        return
      }

      console.log('✅ Praegune parool kontrollitud edukalt')

      // Step 2: Update password with additional security checks
      console.log('🔄 Uuendab parooli...')
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (updateError) {
        console.error('❌ Parooli uuendamise viga:', updateError.message)
        
        // Clear sensitive data
        secureCleanup()
        
        // Handle specific error cases
        let errorMessage = 'Parooli uuendamine ebaõnnestus. Palun proovi uuesti.'
        
        if (updateError.message.includes('rate limit')) {
          errorMessage = 'Liiga palju katseid. Palun oota mõni minut ja proovi uuesti.'
        } else if (updateError.message.includes('weak')) {
          errorMessage = 'Parool on liiga nõrk. Palun vali tugevam parool.'
        }
        
        onMessage?.({
          type: 'error',
          text: errorMessage
        })
        setLoading(false)
        return
      }

      console.log('✅ Parool edukalt uuendatud')

      // Step 3: Show success message briefly before logout
      onMessage?.({
        type: 'success',
        text: 'Parool edukalt uuendatud! Sind logitakse automaatselt välja turvalisuse tagamiseks...'
      })

      // Step 4: Secure cleanup of form data
      secureCleanup()

      // Step 5: Wait a moment to ensure password change is fully processed
      console.log('⏳ Ootab parooli muutuse täielikku töötlemist...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 6: Force logout and redirect to landing page for security
      console.log('🚪 Logib välja ja suunab avalehele turvalisuse tagamiseks...')
      
      // Sign out from Supabase (this ensures clean logout from all sessions)
      await supabase.auth.signOut()
      
      // Clear any remaining authentication state
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      
      // Redirect to landing page
      window.location.href = '/'

    } catch (error) {
      console.error('❌ Parooli uuendamise viga:', error)
      
      // Secure cleanup on any error
      secureCleanup()
      
      onMessage?.({
        type: 'error',
        text: 'Parooli uuendamisel tekkis ootamatu viga. Palun proovi uuesti.'
      })
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div>
      <h3 className="text-2xl font-black text-white mb-8 font-['Orbitron'] uppercase tracking-wider">
        <span className="text-orange-500">◆</span> Parooli muutmine
      </h3>
      
      <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
        {/* Hidden username field for accessibility and security */}
        <input
          type="text"
          name="username"
          value={user?.email || ''}
          autoComplete="username"
          style={{ display: 'none' }}
          readOnly
          tabIndex={-1}
        />

        {/* Current Password Field */}
        <div>
          <label htmlFor="currentPassword" className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-red-500">🔐</span> Praegune parool
          </label>
          <div className="relative">
            <input
              {...passwordForm.register('currentPassword', { 
                required: 'Praegune parool on kohustuslik turvalisuse tagamiseks',
                minLength: {
                  value: 1,
                  message: 'Palun sisesta praegune parool'
                }
              })}
              type={showPasswords.current ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 bg-black/50 border border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              placeholder="Sisesta oma praegune parool"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwordForm.formState.errors.currentPassword && (
            <p className="text-red-400 text-sm mt-2 font-['Orbitron']">{passwordForm.formState.errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label htmlFor="newPassword" className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-purple-500">🔑</span> Uus parool
          </label>
          <div className="relative">
            <input
              {...passwordForm.register('newPassword', { 
                required: 'Uus parool on kohustuslik',
                minLength: {
                  value: 8,
                  message: 'Parool peab olema vähemalt 8 tähemärki pikk'
                },
                validate: {
                  notSameAsCurrent: (value) => {
                    const currentPassword = passwordForm.getValues('currentPassword')
                    return value !== currentPassword || 'Uus parool peab olema erinev praegusest'
                  },
                  hasUppercase: (value) => /[A-Z]/.test(value) || 'Parool peab sisaldama vähemalt üht suurtähte',
                  hasLowercase: (value) => /[a-z]/.test(value) || 'Parool peab sisaldama vähemalt üht väiketähte',
                  hasNumber: (value) => /[0-9]/.test(value) || 'Parool peab sisaldama vähemalt üht numbrit'
                }
              })}
              type={showPasswords.new ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 bg-black/50 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              placeholder="Sisesta oma uus parool"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {newPassword && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider">Parooli tugevus:</span>
                <span className={`text-xs font-bold font-['Orbitron'] uppercase tracking-wider ${
                  passwordStrength <= 2 ? 'text-red-400' : 
                  passwordStrength <= 4 ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-1 rounded-full transition-all duration-500 bg-gradient-to-r ${getPasswordStrengthColor(passwordStrength)} shadow-[0_0_10px_rgba(255,0,64,0.5)]`}
                  style={{ width: `${(passwordStrength / 6) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {passwordForm.formState.errors.newPassword && (
            <p className="text-red-400 text-sm mt-2 font-['Orbitron']">{passwordForm.formState.errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2 font-['Orbitron'] uppercase tracking-wider">
            <span className="text-orange-500">✓</span> Kinnita uus parool
          </label>
          <div className="relative">
            <input
              {...passwordForm.register('confirmPassword', { 
                required: 'Palun kinnita oma uut parooli',
                validate: (value) => {
                  const newPassword = passwordForm.getValues('newPassword')
                  return value === newPassword || 'Paroolid ei ühti'
                }
              })}
              type={showPasswords.confirm ? 'text' : 'password'}
              autoComplete="new-password"
              className="w-full px-4 py-3 pr-12 bg-black/50 border border-orange-500/30 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
              placeholder="Kinnita oma uus parool"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {passwordForm.formState.errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-2 font-['Orbitron']">{passwordForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="tech-border rounded-xl p-6 bg-gradient-to-br from-gray-900/50 to-black/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl text-purple-500">🛡️</span>
            <div>
              <h4 className="font-bold text-white mb-3 font-['Orbitron'] uppercase tracking-wider">
                Parooli nõuded
              </h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className={newPassword && newPassword.length >= 8 ? 'text-green-400' : ''}>
                  <span className={newPassword && newPassword.length >= 8 ? 'text-green-400' : 'text-gray-500'}>
                    {newPassword && newPassword.length >= 8 ? '✓' : '○'}
                  </span> Vähemalt 8 tähemärki
                </li>
                <li className={newPassword && /[A-Z]/.test(newPassword) ? 'text-green-400' : ''}>
                  <span className={newPassword && /[A-Z]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'}>
                    {newPassword && /[A-Z]/.test(newPassword) ? '✓' : '○'}
                  </span> Vähemalt üks suurtäht (A-Z)
                </li>
                <li className={newPassword && /[a-z]/.test(newPassword) ? 'text-green-400' : ''}>
                  <span className={newPassword && /[a-z]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'}>
                    {newPassword && /[a-z]/.test(newPassword) ? '✓' : '○'}
                  </span> Vähemalt üks väiketäht (a-z)
                </li>
                <li className={newPassword && /[0-9]/.test(newPassword) ? 'text-green-400' : ''}>
                  <span className={newPassword && /[0-9]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'}>
                    {newPassword && /[0-9]/.test(newPassword) ? '✓' : '○'}
                  </span> Vähemalt üks number (0-9)
                </li>
                <li className={newPassword && /[^A-Za-z0-9]/.test(newPassword) ? 'text-green-400' : ''}>
                  <span className={newPassword && /[^A-Za-z0-9]/.test(newPassword) ? 'text-green-400' : 'text-gray-500'}>
                    {newPassword && /[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'}
                  </span> Soovitatav: erimärgid (!@#$%^&*)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Security Notice */}
        <div className="relative bg-gradient-to-r from-orange-900/20 to-orange-800/10 border border-orange-500/30 rounded-xl p-6 shadow-[0_0_20px_rgba(255,69,0,0.3)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-orange-300 mb-2 font-['Orbitron'] uppercase tracking-wider">
                ⚠ Oluline turvalisuse märkus
              </h4>
              <div className="text-xs text-orange-200 space-y-1">
                <p>• Parooli muutmisel logitakse sind automaatselt kõikidest seadmetest välja</p>
                <p>• Pärast parooli muutmist suunatakse sind tagasi avalehele</p>
                <p>• Pead uuesti sisse logima uue parooliga</p>
                <p>• Ära jaga oma parooli teistega</p>
                <p>• Kasuta unikaalset parooli, mida ei kasuta teistes teenustes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || passwordStrength < 4}
            className="px-8 py-3 futuristic-btn futuristic-btn-accent rounded-xl font-['Orbitron'] uppercase tracking-wider text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uuendamine...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>◆ Uuenda parooli</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}