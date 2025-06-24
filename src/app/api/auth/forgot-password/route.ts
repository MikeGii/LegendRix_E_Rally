// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { generatePasswordResetEmail, generatePasswordResetTextEmail } from '@/lib/email-templates/passwordResetTemplate'

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
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email configuration missing')
      return NextResponse.json(
        { error: 'Email configuration not properly set' },
        { status: 500 }
      )
    }

    console.log('🔄 Processing password reset request for:', email)

    // Check if user exists in your database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      console.log('❌ User not found:', email)
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate a secure reset token (you could also use Supabase's generateLink)
    const resetToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store the reset token in a password_resets table (you'd need to create this)
    const { error: tokenError } = await supabase
      .from('password_resets')
      .insert([{
        user_id: user.id,
        email: email,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false
      }])

    if (tokenError) {
      console.error('❌ Failed to store reset token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to process reset request' },
        { status: 500 }
      )
    }

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://legendrix-e-rally.vercel.app'}/reset-password?token=${resetToken}`

    // Test email connection
    try {
      await transporter.verify()
      console.log('✅ Email server connection verified')
    } catch (connectionError) {
      console.error('❌ Email connection failed:', connectionError)
      return NextResponse.json(
        { error: 'Email service unavailable' },
        { status: 500 }
      )
    }

    // Generate email content using your template
    const htmlContent = generatePasswordResetEmail(resetLink, email)
    const textContent = generatePasswordResetTextEmail(resetLink, email)

    // Send email
    const mailOptions = {
      from: {
        name: 'LegendRix E-Rally',
        address: process.env.EMAIL_USER!
      },
      to: email,
      subject: 'Parooli lähtestamine - LegendRix E-Rally',
      html: htmlContent,
      text: textContent
    }

    await transporter.sendMail(mailOptions)

    console.log('✅ Password reset email sent successfully to:', email)

    return NextResponse.json(
      { message: 'Password reset email sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('❌ Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}