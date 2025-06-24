// src/utils/authErrors.ts - Centralized authentication error handling

export interface AuthError {
  message: string
  code?: string
  suggestion?: string
  actionRequired?: 'retry' | 'contact_support' | 'verify_email' | 'forgot_password'
}

/**
 * Maps Supabase authentication errors to user-friendly Estonian messages
 */
export function mapAuthError(error: string): AuthError {
  const errorLower = error.toLowerCase()
  
  // Invalid credentials (most common wrong password/email error)
  if (errorLower.includes('invalid login credentials') || 
      errorLower.includes('invalid email or password')) {
    return {
      message: 'Vale e-maili aadress või parool',
      suggestion: 'Kontrolli oma andmeid ja proovi uuesti. Kui oled parooli unustanud, kliki "Unustasid parooli?"',
      actionRequired: 'forgot_password'
    }
  }
  
  // Email not confirmed
  if (errorLower.includes('email not confirmed') || 
      errorLower.includes('email address not confirmed')) {
    return {
      message: 'E-maili aadress ei ole kinnitatud',
      suggestion: 'Kontrolli oma postkasti (ka rämpsposti) ja kinnita e-maili aadress',
      actionRequired: 'verify_email'
    }
  }
  
  // Rate limiting
  if (errorLower.includes('too many requests') || 
      errorLower.includes('rate limit')) {
    return {
      message: 'Liiga palju katseid',
      suggestion: 'Palun oota 5-10 minutit enne uuesti proovimist',
      actionRequired: 'retry'
    }
  }
  
  // Invalid email format
  if (errorLower.includes('invalid email') || 
      errorLower.includes('email address is invalid')) {
    return {
      message: 'E-maili aadress on vigases formaadis',
      suggestion: 'Kontrolli, et e-maili aadress sisaldab @ märki ja domeeni'
    }
  }
  
  // Password requirements
  if (errorLower.includes('password is too short') || 
      errorLower.includes('password must be at least')) {
    return {
      message: 'Parool ei vasta nõuetele',
      suggestion: 'Parool peab olema vähemalt 8 tähemärki pikk'
    }
  }
  
  // Network issues
  if (errorLower.includes('network') || 
      errorLower.includes('connection') ||
      errorLower.includes('fetch')) {
    return {
      message: 'Ühenduse probleem',
      suggestion: 'Kontrolli internetiühendust ja proovi uuesti',
      actionRequired: 'retry'
    }
  }
  
  // Server errors
  if (errorLower.includes('server error') || 
      errorLower.includes('internal error') ||
      errorLower.includes('500')) {
    return {
      message: 'Serveri viga',
      suggestion: 'Palun proovi mõne aja pärast uuesti',
      actionRequired: 'retry'
    }
  }
  
  // Account status issues
  if (errorLower.includes('account suspended') || 
      errorLower.includes('account disabled') ||
      errorLower.includes('account blocked')) {
    return {
      message: 'Kasutajakonto on peatatud',
      suggestion: 'Palun võta ühendust administraatoriga',
      actionRequired: 'contact_support'
    }
  }
  
  // Signup disabled
  if (errorLower.includes('signup disabled') || 
      errorLower.includes('signups disabled')) {
    return {
      message: 'Registreerimine on ajutiselt välja lülitatud',
      suggestion: 'Palun proovi hiljem uuesti',
      actionRequired: 'contact_support'
    }
  }
  
  // User not found (more specific than invalid credentials)
  if (errorLower.includes('user not found') || 
      errorLower.includes('no user found')) {
    return {
      message: 'Kasutajat ei leitud',
      suggestion: 'Kontrolli e-maili aadressi või registreeru uus konto'
    }
  }
  
  // Session expired
  if (errorLower.includes('session') && errorLower.includes('expired')) {
    return {
      message: 'Sessioon on aegunud',
      suggestion: 'Palun logi uuesti sisse',
      actionRequired: 'retry'
    }
  }
  
  // Default fallback
  return {
    message: 'Sisselogimine ebaõnnestus',
    suggestion: 'Palun kontrolli oma andmeid ja proovi uuesti',
    actionRequired: 'retry'
  }
}

/**
 * Gets help suggestions based on number of failed attempts
 */
export function getLoginHelp(attemptCount: number): string[] {
  const baseHelp = [
    'Kontrolli Caps Lock klahvi',
    'Veendu, et e-mail on õigesti kirjutatud'
  ]
  
  if (attemptCount >= 2) {
    return [
      ...baseHelp,
      'Proovi kopeerida e-maili aadress mujalt',
      'Kui oled parooli unustanud, kliki "Unustasid parooli?"'
    ]
  }
  
  if (attemptCount >= 4) {
    return [
      ...baseHelp,
      'Kontrolli, et kasutad õiget e-maili aadressi',
      'Võib-olla kasutad teist parooli kui arvad',
      'Proovi parooli lähtestamist'
    ]
  }
  
  return baseHelp
}

/**
 * Determines if an error should show the "Forgot Password" suggestion
 */
export function shouldShowForgotPassword(error: string): boolean {
  const errorLower = error.toLowerCase()
  return errorLower.includes('invalid login credentials') ||
         errorLower.includes('invalid email or password') ||
         errorLower.includes('wrong password') ||
         errorLower.includes('incorrect password')
}

/**
 * Format error message for display with optional help text
 */
export function formatAuthErrorForDisplay(
  error: string, 
  attemptCount: number = 0,
  showHelp: boolean = false
): {
  message: string
  help?: string[]
  showForgotPassword?: boolean
} {
  const authError = mapAuthError(error)
  const result: any = {
    message: authError.message
  }
  
  if (showHelp && attemptCount >= 2) {
    result.help = getLoginHelp(attemptCount)
  }
  
  if (shouldShowForgotPassword(error)) {
    result.showForgotPassword = true
  }
  
  return result
}