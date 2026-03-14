// Social media verification utilities

// Generate random verification code
export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'ONAGUI-'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Extract username from social media URL
export function extractUsername(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url)
    
    switch (platform) {
      case 'twitter':
        // https://twitter.com/username or https://x.com/username
        const twitterMatch = urlObj.pathname.match(/^\/([^\/]+)/)
        return twitterMatch ? twitterMatch[1] : null
        
      case 'instagram':
        // https://instagram.com/username
        const instaMatch = urlObj.pathname.match(/^\/([^\/]+)/)
        return instaMatch ? instaMatch[1] : null
        
      case 'tiktok':
        // https://tiktok.com/@username
        const tiktokMatch = urlObj.pathname.match(/^\/@?([^\/]+)/)
        return tiktokMatch ? tiktokMatch[1] : null
        
      case 'youtube':
        // https://youtube.com/@username or /channel/ID
        const youtubeMatch = urlObj.pathname.match(/^\/@?([^\/]+)/)
        return youtubeMatch ? youtubeMatch[1] : null
        
      default:
        return null
    }
  } catch {
    return null
  }
}

// Platforms that support free verification
export const verifiablePlatforms = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    instructions: 'Add the verification code to your Twitter/X bio, then click "Verify". You can remove it after verification.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    instructions: 'Add the verification code to your Instagram bio, then click "Verify". You can remove it after verification.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    instructions: 'Add the verification code to your TikTok bio, then click "Verify". You can remove it after verification.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    instructions: 'Add the verification code to your channel description, then click "Verify". You can remove it after verification.',
  },
]
