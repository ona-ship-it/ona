import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
}

const supabase = createClient(
  supabaseUrl!,
  supabaseServiceKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    console.log('📥 GET /api/admin/social-verifications')
    
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'pending'

    console.log('Filter:', filter)

    // Check admin auth
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.error('❌ No authorization header')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!user || user.email !== 'admin@onagui.com') {
      console.error('❌ Not admin:', user?.email)
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    console.log('✅ Admin authenticated:', user.email)

    // Fetch verifications
    let query = supabase
      .from('social_verifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter === 'pending') {
      query = query.eq('status', 'pending')
    }

    const { data: verifications, error } = await query

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log('✅ Found verifications:', verifications?.length || 0)

    // Get user details
    const userIds = [...new Set(verifications?.map(v => v.user_id) || [])]
    console.log('Fetching user details for:', userIds.length, 'users')

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      console.error('⚠️ Error fetching users:', usersError)
      // Continue without user details
    }

    // Enrich with user data
    const enrichedData = verifications?.map(v => {
      const userData = users?.find(u => u.id === v.user_id)
      return {
        ...v,
        user_email: userData?.email || 'Unknown',
        user_name: userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || 'Unknown'
      }
    })

    console.log('✅ Returning enriched data')

    return NextResponse.json({ 
      success: true,
      verifications: enrichedData || [] 
    })

  } catch (error: any) {
    console.error('❌ GET Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

// POST - Approve or Reject
export async function POST(request: Request) {
  try {
    console.log('📥 POST /api/admin/social-verifications')

    // Parse body
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('❌ Invalid JSON body')
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { action, verificationId, rejectionReason } = body

    console.log('Action:', action)
    console.log('Verification ID:', verificationId)

    // Validate
    if (!action || !verificationId) {
      console.error('❌ Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing action or verificationId' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      console.error('❌ Invalid action:', action)
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      )
    }

    // Check admin auth
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.error('❌ No authorization header')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user || user.email !== 'admin@onagui.com') {
      console.error('❌ Not authorized')
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 })
    }

    console.log('✅ Admin authenticated:', user.email)

    // Get verification
    const { data: verification, error: fetchError } = await supabase
      .from('social_verifications')
      .select('*')
      .eq('id', verificationId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching verification:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Verification not found' },
        { status: 404 }
      )
    }

    if (!verification) {
      console.error('❌ Verification not found')
      return NextResponse.json(
        { success: false, error: 'Verification not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found verification:', verification.id)

    if (action === 'approve') {
      console.log('⏳ Approving verification...')

      // 1. Update verification
      const { error: verifyError } = await supabase
        .from('social_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', verificationId)

      if (verifyError) {
        console.error('❌ Error updating verification:', verifyError)
        throw verifyError
      }

      console.log('✅ Verification updated')

      // 2. Update profile
      const verifiedField = `${verification.platform}_verified`
      console.log('⏳ Updating profile field:', verifiedField)

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ [verifiedField]: true })
        .eq('id', verification.user_id)

      if (profileError) {
        console.error('❌ Error updating profile:', profileError)
        throw profileError
      }

      console.log('✅ Profile updated')

      return NextResponse.json({
        success: true,
        message: 'Verification approved successfully'
      })

    } else if (action === 'reject') {
      console.log('⏳ Rejecting verification...')

      const { error: rejectError } = await supabase
        .from('social_verifications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || 'No reason provided',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', verificationId)

      if (rejectError) {
        console.error('❌ Error rejecting:', rejectError)
        throw rejectError
      }

      console.log('✅ Verification rejected')

      return NextResponse.json({
        success: true,
        message: 'Verification rejected successfully'
      })
    }

  } catch (error: any) {
    console.error('❌ POST Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
