import { NextResponse } from 'next/server'
import { 
  scrapeTwitterBio, 
  scrapeInstagramBio, 
  scrapeTikTokBio, 
  scrapeYouTubeDescription 
} from '@/utils/socialMediaScrapers'
import { extractUsername } from '@/utils/socialVerification'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, username, verificationCode, profileUrl } = body

    if (!platform || !verificationCode) {
      return NextResponse.json(
        { verified: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Extract username from URL if not provided
    const actualUsername = username || extractUsername(profileUrl, platform)
    
    if (!actualUsername) {
      return NextResponse.json(
        { verified: false, error: 'Invalid profile URL' },
        { status: 400 }
      )
    }

    let bioText = ''

    // Scrape based on platform
    try {
      switch (platform) {
        case 'twitter':
          bioText = await scrapeTwitterBio(actualUsername)
          break

        case 'instagram':
          bioText = await scrapeInstagramBio(actualUsername)
          break

        case 'tiktok':
          bioText = await scrapeTikTokBio(actualUsername)
          break

        case 'youtube':
          bioText = await scrapeYouTubeDescription(actualUsername)
          break

        default:
          throw new Error('Unsupported platform')
      }
    } catch (scrapeError: any) {
      return NextResponse.json(
        { 
          verified: false, 
          error: scrapeError.message || 'Failed to check profile. Make sure it\'s public.' 
        },
        { status: 400 }
      )
    }

    // Check if verification code exists in bio
    const verified = bioText.toLowerCase().includes(verificationCode.toLowerCase())

    if (!verified) {
      return NextResponse.json(
        { 
          verified: false, 
          error: 'Verification code not found in bio. Please add it and try again.' 
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      verified: true,
      message: 'Account verified successfully!'
    })

  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { 
        verified: false, 
        error: 'Verification failed. Please try again later.' 
      },
      { status: 500 }
    )
  }
}

// Set max duration for serverless function (Vercel)
export const maxDuration = 30 // 30 seconds
