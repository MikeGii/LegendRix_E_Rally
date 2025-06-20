// src/app/api/rallies/update-statuses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting server-side rally status update...')
    const currentTime = new Date().toISOString()
    const now = new Date()
    
    // Get ALL rallies that might need status updates
    const { data: rallies, error: fetchError } = await supabase
      .from('rallies')
      .select('id, name, competition_date, registration_deadline, status, is_active')
      .eq('is_active', true) // Only active rallies
      .order('competition_date', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching rallies:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch rallies', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!rallies || rallies.length === 0) {
      console.log('✅ No rallies found to update')
      return NextResponse.json({ 
        success: true, 
        updated: 0, 
        message: 'No rallies found' 
      })
    }

    let updatedCount = 0
    const updates: any[] = []

    for (const rally of rallies) {
      const competitionDate = new Date(rally.competition_date)
      const registrationDeadline = new Date(rally.registration_deadline)
      // EXACTLY 1 hour after competition as per requirements
      const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
      
      let newStatus = rally.status
      
      // Determine correct status based on dates
      if (now > oneHourAfterCompetition) {
        // Rally finished more than 1 hour ago -> completed
        newStatus = 'completed'
      } else if (now > competitionDate) {
        // Rally is currently happening -> active
        newStatus = 'active'
      } else if (now > registrationDeadline) {
        // Registration deadline passed but rally hasn't started -> registration_closed
        newStatus = 'registration_closed'
      } else {
        // Registration is still open -> registration_open
        newStatus = 'registration_open'
      }
      
      // Only update if status has changed
      if (newStatus !== rally.status) {
        console.log(`📅 Updating rally "${rally.name}" (${rally.id}): ${rally.status} → ${newStatus}`)
        
        const { error: updateError } = await supabase
          .from('rallies')
          .update({ 
            status: newStatus,
            updated_at: currentTime
          })
          .eq('id', rally.id)
        
        if (updateError) {
          console.error(`❌ Error updating rally ${rally.id}:`, updateError)
          updates.push({
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
            success: true
          })
        }
      } else {
        console.log(`✅ Rally "${rally.name}" status already correct: ${rally.status}`)
      }
    }
    
    console.log(`✅ Rally status update complete. Updated ${updatedCount} rallies.`)
    
    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: rallies.length,
      updates: updates,
      timestamp: currentTime
    })

  } catch (error) {
    console.error('❌ Rally status update failed:', error)
    return NextResponse.json(
      { 
        error: 'Rally status update failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// GET method for manual trigger or health check
export async function GET() {
  try {
    console.log('🔍 Rally status health check...')
    
    const { data: rallies, error } = await supabase
      .from('rallies')
      .select('id, name, competition_date, registration_deadline, status, is_active')
      .eq('is_active', true)
      .order('competition_date', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    const now = new Date()
    const statusSummary = rallies.map(rally => {
      const competitionDate = new Date(rally.competition_date)
      const registrationDeadline = new Date(rally.registration_deadline)
      const oneHourAfterCompetition = new Date(competitionDate.getTime() + (1 * 60 * 60 * 1000))
      
      let expectedStatus: string
      if (now > oneHourAfterCompetition) {
        expectedStatus = 'completed'
      } else if (now > competitionDate) {
        expectedStatus = 'active'
      } else if (now > registrationDeadline) {
        expectedStatus = 'registration_closed'
      } else {
        expectedStatus = 'registration_open'
      }

      return {
        id: rally.id,
        name: rally.name,
        currentStatus: rally.status,
        expectedStatus: expectedStatus,
        needsUpdate: rally.status !== expectedStatus,
        competitionDate: rally.competition_date,
        registrationDeadline: rally.registration_deadline
      }
    })

    const needsUpdate = statusSummary.filter(r => r.needsUpdate)
    
    return NextResponse.json({
      success: true,
      totalRallies: rallies.length,
      ralliesNeedingUpdate: needsUpdate.length,
      rallies: statusSummary,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}