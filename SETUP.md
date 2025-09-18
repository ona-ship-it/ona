# Setup Guide for onagui.com

## External Services Setup

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 2. Upstash Redis Setup

1. Go to [Upstash](https://upstash.com) and create a Redis database
2. Get your REST URL and token from the database dashboard
3. Update `.env.local` with your Redis credentials:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your actual values for each service
3. Never commit `.env.local` to version control

## File Structure Created

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Auth middleware
│   ├── auth/
│   │   ├── context.tsx    # Auth context provider
│   │   └── utils.ts       # Auth utility functions
│   └── redis.ts           # Redis client and helpers
├── middleware.ts          # Next.js middleware
└── ...
```

## Usage Examples

### Using Auth Context

```tsx
import { AuthProvider, useAuth } from '@/lib/auth/context'

// Wrap your app
function App({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

// Use in components
function LoginButton() {
  const { signIn, user } = useAuth()
  
  if (user) return <div>Welcome {user.email}</div>
  
  return (
    <button onClick={() => signIn(email, password)}>
      Sign In
    </button>
  )
}
```

### Using Supabase Client

```tsx
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// In client components
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

### Using Redis

```tsx
import { RedisService } from '@/lib/redis'

// Cache data
await RedisService.set('user:123', userData, 3600)

// Get cached data
const userData = await RedisService.get('user:123')

// Rate limiting
const limit = await RedisService.rateLimit('api:user:123', 100, 3600)
```

## Next Steps

1. Set up your Supabase database schema
2. Configure authentication providers in Supabase
3. Set up your Redis database structure
4. Create your first authenticated pages
5. Implement your business logic

## Development

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`