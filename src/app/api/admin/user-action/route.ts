// src/app/api/admin/user-action/route.ts - Clean API without HTML
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { generateUserActionEmail } from '@/lib/email-templates/userActionTemplate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// SMTP Configuration
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
    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
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

    console.log(`🔄 Processing user ${action} for user ID:`, userId)

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('❌ User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user status
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const newAdminApproved = action === 'approve'

    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: newStatus,
        admin_approved: newAdminApproved,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Failed to update user status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    console.log(`✅ User status updated: ${user.email} -> ${newStatus}`)

    // Test email connection before sending
    try {
      await transporter.verify()
      console.log('✅ Email server connection verified')
    } catch (connectionError) {
      const errorMessage = connectionError instanceof Error 
        ? connectionError.message 
        : 'Unknown connection error'
      console.error('❌ Email connection error:', {
        message: errorMessage,
        host: 'smtp.zone.eu',
        port: 465,
        user: process.env.EMAIL_USER
      })
      
      return NextResponse.json({
        error: 'Email server connection failed',
        details: errorMessage,
        suggestion: 'Please check your Zone.eu email credentials and ensure SMTP is enabled'
      }, { status: 500 })
    }

    // Generate email content using template
    const emailData = {
      user: {
        name: user.name,
        email: user.email,
        player_name: user.player_name
      },
      action: action as 'approve' | 'reject',
      reason
    }

    const { subject, html: htmlContent } = generateUserActionEmail(emailData)

    // Send notification email to user
    try {
      console.log(`📧 Sending ${action} notification to: ${user.email}`)
      
      const mailOptions = {
        from: `"LegendRix E-Rally" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: htmlContent
      }

      const result = await transporter.sendMail(mailOptions)
      console.log(`✅ ${action} notification email sent successfully:`, result.messageId)
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      // Don't fail the operation if email fails - user status was already updated
      return NextResponse.json({
        message: `User ${action}ed successfully, but email notification failed`,
        userId,
        action,
        newStatus,
        emailError: emailError instanceof Error ? emailError.message : 'Unknown email error'
      })
    }

    return NextResponse.json({
      message: `User ${action}ed successfully and notification email sent`,
      userId,
      action,
      newStatus,
      userEmail: user.email
    })

  } catch (error) {
    console.error('❌ User action error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}