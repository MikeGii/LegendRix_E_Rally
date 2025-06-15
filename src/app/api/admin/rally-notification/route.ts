// src/app/api/admin/rally-notification/route.ts - Clean API without HTML
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { generateRallyNotificationEmail } from '@/lib/email-templates/rallyNotificationTemplate'

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

    // Get rally details with related data including events
    const { data: rally, error: rallyError } = await supabase
      .from('rallies')
      .select(`
        *,
        games (name),
        game_types (name),
        rally_events (
          *,
          event:game_events(name),
          rally_event_tracks(
            *,
            track:event_tracks(name, length_km, surface_type)
          )
        )
      `)
      .eq('id', rallyId)
      .eq('rally_events.is_active', true)
      .single()

    if (rallyError || !rally) {
      console.error('❌ Rally not found:', rallyError)
      return NextResponse.json(
        { error: 'Rally not found' },
        { status: 404 }
      )
    }

    // Process rally events (Riigid)
    const rallyEvents = rally.rally_events || []
    const formattedEvents = rallyEvents
      .sort((a: any, b: any) => a.event_order - b.event_order)
      .map((re: any) => ({
        name: re.event?.name || 'Määramata riik',
        order: re.event_order
      }))

    console.log('📅 Rally events found:', formattedEvents.length)

    // Get email recipients
    let userEmails: string[] = []
    
    if (testEmail) {
      userEmails = [testEmail]
      console.log('🧪 Test mode - sending to:', testEmail)
    } else {
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

    // Test SMTP connection
    console.log('🔄 Testing SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (connectionError) {
      console.error('❌ SMTP connection failed:', connectionError)
      
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

    // Generate email content using template
    const emailData = {
      rally: {
        id: rally.id,
        name: rally.name,
        description: rally.description,
        competition_date: rally.competition_date,
        registration_deadline: rally.registration_deadline,
        max_participants: rally.max_participants,
        rules: rally.rules,
        is_featured: rally.is_featured,
        games: rally.games,
        game_types: rally.game_types
      },
      events: formattedEvents
    }

    const { subject, html: htmlContent } = generateRallyNotificationEmail(emailData)

    // Send emails
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