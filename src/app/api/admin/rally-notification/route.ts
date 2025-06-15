// src/app/api/admin/rally-notification/route.ts - Fixed Zone.eu SMTP Configuration
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Use EXACT same configuration as working user-action route
const transporter = nodemailer.createTransport({
  host: 'smtp.zone.eu',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates (same as Zone.eu needs)
  }
})

export async function POST(request: NextRequest) {
  try {
    const { rallyId, testEmail } = await request.json()

    if (!rallyId) {
      return NextResponse.json(
        { error: 'Rally ID is required' },
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

    console.log('📧 Email config check:', {
      host: 'smtp.zone.eu',
      port: 465,
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD
    })

    // Get rally details with related data
    const { data: rally, error: rallyError } = await supabase
      .from('rallies')
      .select(`
        *,
        games (name),
        game_types (name)
      `)
      .eq('id', rallyId)
      .single()

    if (rallyError || !rally) {
      console.error('❌ Rally not found:', rallyError)
      return NextResponse.json(
        { error: 'Rally not found' },
        { status: 404 }
      )
    }

    console.log('✅ Rally found:', rally.name)

    // Get all registered users (approved users with verified emails)
    let userEmails: string[] = []
    
    if (testEmail) {
      // For testing - send only to specified email
      userEmails = [testEmail]
      console.log('🧪 Test mode - sending to:', testEmail)
    } else {
      // Get all approved users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('email, name')
        .eq('status', 'approved')
        .eq('email_verified', true)
        .eq('admin_approved', true)

      if (usersError) {
        console.error('❌ Error fetching users:', usersError)
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }

      userEmails = users.map(user => user.email)
      console.log('👥 Production mode - found', userEmails.length, 'users')
    }

    if (userEmails.length === 0) {
      return NextResponse.json(
        { error: 'No users found to notify' },
        { status: 400 }
      )
    }

    // Format dates for Estonian locale
    const formatEstonianDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('et-EE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Create Estonian email template
    const subject = `🏁 Uus ralli: ${rally.name} - LegendRix E-Rally`
    
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 15px 15px 0 0; color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🏁 Uus ralli avaldatud!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">LegendRix E-Rally Championship</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Rally Title -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 10px 0;">${rally.name}</h2>
            ${rally.description ? `<p style="color: #64748b; font-size: 16px; margin: 0;">${rally.description}</p>` : ''}
          </div>

          <!-- Rally Details Card -->
          <div style="background: #f1f5f9; border-radius: 10px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #334155; margin: 0 0 20px 0; font-size: 18px;">📅 Ralli üksikasjad</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center;">
                <span style="color: #64748b; font-weight: 500; width: 140px;">🎮 Mäng:</span>
                <span style="color: #1e293b;">${rally.games?.name || 'Määramata'}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #64748b; font-weight: 500; width: 140px;">🏆 Tüüp:</span>
                <span style="color: #1e293b;">${rally.game_types?.name || 'Määramata'}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #64748b; font-weight: 500; width: 140px;">🏁 Võistluse kuupäev:</span>
                <span style="color: #dc2626; font-weight: 600;">${formatEstonianDate(rally.competition_date)}</span>
              </div>
              
              <div style="display: flex; align-items: center;">
                <span style="color: #64748b; font-weight: 500; width: 140px;">📝 Registreerimine kuni:</span>
                <span style="color: #ea580c; font-weight: 600;">${formatEstonianDate(rally.registration_deadline)}</span>
              </div>
              
              ${rally.max_participants ? `
                <div style="display: flex; align-items: center;">
                  <span style="color: #64748b; font-weight: 500; width: 140px;">👥 Max osalejaid:</span>
                  <span style="color: #1e293b;">${rally.max_participants}</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${rally.rules ? `
            <!-- Rules Section -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 Reeglid</h4>
              <p style="color: #78350f; margin: 0; line-height: 1.6;">${rally.rules}</p>
            </div>
          ` : ''}

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://legendrix-e-rally.vercel.app/registration?rally=${rally.id}" 
               style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);">
              🚀 Registreeru kohe!
            </a>
          </div>

          <!-- Competition Status -->
          ${rally.is_featured ? `
            <div style="text-align: center; margin: 20px 0;">
              <span style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ⭐ Esile tõstetud ralli
              </span>
            </div>
          ` : ''}

          <!-- Footer Info -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
              Küsimused? Võta meiega ühendust meie Discord serveris või e-posti teel.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              LegendRix E-Rally Championship • Powered by EWRC
            </p>
          </div>
        </div>
      </div>
    `

    // Test transporter connection first with better error handling
    console.log('🔄 Testing SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (connectionError) {
      console.error('❌ SMTP connection failed:', connectionError)
      
      // More detailed error information
      const errorMessage = connectionError instanceof Error ? connectionError.message : 'Unknown connection error'
      console.error('❌ Connection error details:', {
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

    // Send emails with detailed error logging
    let successCount = 0
    let failureCount = 0
    const failedEmails: { email: string; error: string }[] = []

    console.log(`📧 Starting to send ${userEmails.length} emails...`)

    for (const email of userEmails) {
      try {
        console.log(`📧 Sending to: ${email}`)
        
        const mailOptions = {
          from: `"LegendRix E-Rally" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          html: htmlContent
        }

        const result = await transporter.sendMail(mailOptions)
        console.log(`✅ Email sent successfully to ${email}:`, result.messageId)
        successCount++
        
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${email}:`, emailError)
        failureCount++
        failedEmails.push({
          email,
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        })
      }
    }

    console.log(`📧 Rally notification completed: ${successCount} success, ${failureCount} failures`)
    
    if (failedEmails.length > 0) {
      console.log('❌ Failed emails:', failedEmails)
    }

    return NextResponse.json({
      message: 'Rally notification process completed',
      rallyId,
      rallyName: rally.name,
      emailsSent: successCount,
      emailsFailed: failureCount,
      totalEmails: userEmails.length,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined
    })

  } catch (error) {
    console.error('❌ Rally notification error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}