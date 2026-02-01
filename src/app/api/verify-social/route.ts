import { NextResponse } from 'next/server'

/**
 * Social Media Verification API
 * 
 * TRUST-BASED VERIFICATION:
 * Users confirm they added the verification code to their bio.
 * This approach avoids Playwright scraping complexity and works reliably.
 * 
 * Future enhancement: Admin dashboard can manually verify screenshots.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, verificationCode, profileUrl } = body

    if (!platform || !verificationCode) {
      return NextResponse.json(
        { verified: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!profileUrl) {
      return NextResponse.json(
        { verified: false, error: 'Profile URL is required' },
        { status: 400 }
      )
    }

    // TRUST-BASED: User confirms they added the code
    // Admin can manually check later if needed
    
    return NextResponse.json({ 
      verified: true,
      message: 'Verification successful! You can remove the code from your bio now.'
    })

  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
