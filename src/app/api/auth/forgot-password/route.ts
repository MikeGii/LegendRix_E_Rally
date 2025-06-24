// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { generatePasswordResetEmail } from '@/lib/email-templates/passwordResetTemplate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// SMTP Configuration (using your existing Zone.eu setup)
const transporter = nodemailer.createTransport({
  host: 'smtp.zone.eu',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!
  },
  tls: {
    rejectUnauthorized: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-maili aadress on kohustuslik' },
        { status: 400 }
      )
    }

    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email configuration missing')
      return NextResponse.json(
        { error: 'E-maili konfiguratsioon puudub' },
        { status: 500 }
      )
    }

    console.log('🔄 Processing password reset request for:', email)

    // Check if user exists in your database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (userError || !user) {
      console.log('❌ User not found:', email)
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'Kui konto selle e-maili aadressiga eksisteerib, saadeti parooli lähtestamise link.' },
        { status: 200 }
      )
    }

    // Check for recent reset requests (rate limiting)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const { data: recentResets } = await supabase
      .from('password_resets')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .gte('created_at', oneHourAgo.toISOString())
      .limit(1)

    if (recentResets && recentResets.length > 0) {
      console.log('⚠️ Rate limiting: Recent reset request found for:', email)
      return NextResponse.json(
        { message: 'Parooli lähtestamise link on juba saadetud. Palun kontrolli oma e-maili või oota 1 tund.' },
        { status: 429 }
      )
    }

    // Generate a secure reset token
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Clean up old unused tokens for this user
    await supabase
      .from('password_resets')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false)

    // Store the reset token
    const { error: tokenError } = await supabase
      .from('password_resets')
      .insert([{
        user_id: user.id,
        email: email.trim().toLowerCase(),
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      }])

    if (tokenError) {
      console.error('❌ Failed to store reset token:', tokenError)
      return NextResponse.json(
        { error: 'Parooli lähtestamise taotluse töötlemine ebaõnnestus' },
        { status: 500 }
      )
    }

    // Test email connection
    try {
      await transporter.verify()
      console.log('✅ Email server connection verified')
    } catch (connectionError) {
      console.error('❌ Email connection failed:', connectionError)
      return NextResponse.json(
        { error: 'E-maili teenus ei ole saadaval' },
        { status: 500 }
      )
    }

    // Generate email content using your template
    const emailData = {
      user: {
        name: user.name,
        email: user.email,
        player_name: user.player_name
      },
      resetToken,
      expiresAt
    }

    const { subject, html } = generatePasswordResetEmail(emailData)

    // Send email
    const mailOptions = {
      from: {
        name: 'LegendRix E-Rally',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject,
      html
    }

    await transporter.sendMail(mailOptions)

    console.log('✅ Password reset email sent successfully to:', email)

    return NextResponse.json(
      { message: 'Parooli lähtestamise link saadetud edukalt' },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Password reset error:', error)
    return NextResponse.json(
      { error: 'Serveri viga' },
      { status: 500 }
    )
  }
}