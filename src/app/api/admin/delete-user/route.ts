// src/app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🗑️ Deleting user:', userId)

    // Get user details before deletion (for logging)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('User not found:', userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user from database
    // This will cascade delete related data due to foreign key constraints
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    console.log(`✅ User deleted successfully: ${user.name} (${user.email})`)

    return NextResponse.json({
      message: 'User deleted successfully',
      userId,
      deletedUser: {
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}