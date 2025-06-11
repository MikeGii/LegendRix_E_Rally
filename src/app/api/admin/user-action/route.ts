import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.zone.eu',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!
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
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
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
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    // Send notification email to user
    try {
      const isApproved = action === 'approve'
      const subject = isApproved 
        ? 'Account Approved - Welcome to LegendRix E-Rally!' 
        : 'Account Registration Update - LegendRix E-Rally'

      const htmlContent = isApproved ? `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; color: white;">
            <h1 style="text-align: center; margin-bottom: 30px;">🎉 Welcome to LegendRix E-Rally!</h1>
            
            <p>Hello ${user.name},</p>
            
            <p>Great news! Your account has been approved by our administrators. You can now access all rally features and start competing!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://legendrix-e-rally.vercel.app" style="background: #ffffff; color: #059669; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Start Racing!
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
              <p><strong>What you can do now:</strong></p>
              <ul>
                <li>Browse and register for upcoming rallies</li>
                <li>Track your performance and statistics</li>
                <li>Compete with drivers worldwide</li>
                <li>Access exclusive championship events</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">Welcome to the championship! 🏁</p>
          </div>
        </div>
      ` : `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px; color: white;">
            <h1 style="text-align: center; margin-bottom: 30px;">Account Registration Update</h1>
            
            <p>Hello ${user.name},</p>
            
            <p>We regret to inform you that your registration for LegendRix E-Rally could not be approved at this time.</p>
            
            ${reason ? `
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Reason:</strong></p>
                <p>${reason}</p>
              </div>
            ` : ''}
            
            <p>If you believe this is an error or would like to discuss your application, please contact our support team.</p>
            
            <p style="margin-top: 30px; font-size: 12px; opacity: 0.8;">
              Thank you for your interest in LegendRix E-Rally.
            </p>
          </div>
        </div>
      `

      await transporter.sendMail({
        from: `"LegendRix E-Rally" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: htmlContent
      })

      console.log(`${action} notification email sent to:`, user.email)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the operation if email fails
    }

    return NextResponse.json({
      message: `User ${action}ed successfully`,
      userId,
      action,
      newStatus
    })

  } catch (error) {
    console.error('User action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}