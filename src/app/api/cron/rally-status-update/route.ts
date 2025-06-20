// src/app/api/cron/rally-status-update/route.ts
// This can be called by external cron services like Vercel Cron or cPanel cron jobs

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 CRON: Starting automated rally status update...')
    
    // Check for authorization header (optional security)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET_TOKEN
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.log('❌ CRON: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentTime = new Date().toISOString()
    const now = new Date()
    
    // Get ALL active rallies
    const { data: rallies, error: fetchError } = await supabase
      .from('rallies')
      .select('id, name, competition_date, registration_deadline, status, is_active')
      .eq('is_active', true)
      .order('competition_date', { ascending: false })

    if (fetchError) {
      console.error('❌ CRON: Error fetching rallies:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch rallies', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!rallies || rallies.length === 0) {
      console.log('✅ CRON: No rallies found to update')
      return NextResponse.json({ 
        success: true, 
        updated: 0, 
        message: 'No rallies found',
        timestamp: currentTime,
        source: 'cron'
      })
    }

    let updatedCount = 0
    const updates: any[] = []
    const errors: any[] = []

    for (const rally of rallies) {
      try {
        const competitionDate = new Date(rally.competition_date)
        const registrationDeadline = new Date(rally.registration_deadline)
        const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
        
        let newStatus = rally.status
        
        // Status logic (exactly as requested)
        if (now > oneHourAfterCompetition) {
          newStatus = 'completed' // 4. When competition time has passed by 1 hour - Lõppenud
        } else if (now > competitionDate) {
          newStatus = 'active' // 3. When competition time arrives - Käimasolev
        } else if (now > registrationDeadline) {
          newStatus = 'registration_closed' // 2. Registration deadline passed but competition not started - Registreerimine suletud
        } else {
          newStatus = 'registration_open' // 1. Up to registration deadline - Registreerimine avatud
        }
        
        if (newStatus !== rally.status) {
          console.log(`🕐 CRON: Updating rally "${rally.name}": ${rally.status} → ${newStatus}`)
          
          const { error: updateError } = await supabase
            .from('rallies')
            .update({ 
              status: newStatus,
              updated_at: currentTime
            })
            .eq('id', rally.id)
          
          if (updateError) {
            console.error(`❌ CRON: Error updating rally ${rally.id}:`, updateError)
            errors.push({
              rallyId: rally.id,
              name: rally.name,
              error: updateError.message
            })
          } else {
            updatedCount++
            updates.push({
              rallyId: rally.id,
              name: rally.name,
              oldStatus: rally.status,
              newStatus: newStatus,
              success: true,
              timestamp: currentTime
            })
          }
        } else {
          console.log(`✅ CRON: Rally "${rally.name}" status already correct: ${rally.status}`)
        }
      } catch (rallyError) {
        console.error(`❌ CRON: Error processing rally ${rally.id}:`, rallyError)
        errors.push({
          rallyId: rally.id,
          name: rally.name,
          error: rallyError instanceof Error ? rallyError.message : 'Unknown error'
        })
      }
    }
    
    console.log(`✅ CRON: Rally status update complete. Updated ${updatedCount}/${rallies.length} rallies.`)
    
    const result = {
      success: true,
      updated: updatedCount,
      total: rallies.length,
      errors: errors.length,
      updates: updates,
      errorDetails: errors,
      timestamp: currentTime,
      source: 'cron',
      nextRun: 'Check your cron configuration'
    }

    // If there were errors, return 207 (Multi-Status) instead of 200
    const statusCode = errors.length > 0 ? 207 : 200
    
    return NextResponse.json(result, { status: statusCode })

  } catch (error) {
    console.error('❌ CRON: Rally status update failed:', error)
    return NextResponse.json(
      { 
        error: 'CRON rally status update failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        source: 'cron'
      },
      { status: 500 }
    )
  }
}

// Also allow POST for consistency
export async function POST(request: NextRequest) {
  return GET(request)
}

// Manual trigger endpoint for admin
export async function PUT(request: NextRequest) {
  console.log('🔧 MANUAL: Admin manual rally status update triggered')
  return GET(request)
}