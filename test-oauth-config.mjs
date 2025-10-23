import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing OAuth Configuration...\n');

console.log('Environment Variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('- NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

console.log('\n📋 OAuth Configuration Analysis:');
console.log('The error URL shows that the OAuth flow is trying to redirect to:');
console.log('- site_url in JWT: "https://onagui.com"');
console.log('- Expected for local dev: "http://localhost:3000"');

console.log('\n🔧 Potential Solutions:');
console.log('1. Update Supabase project settings:');
console.log('   - Go to Supabase Dashboard > Authentication > URL Configuration');
console.log('   - Set Site URL to: http://localhost:3000');
console.log('   - Add http://localhost:3000/auth/callback to Redirect URLs');

console.log('\n2. Alternative: Use environment-specific configuration');
console.log('   - Keep production URL in Supabase dashboard');
console.log('   - Override locally using SUPABASE_AUTH_EXTERNAL_*_REDIRECT_URI');

console.log('\n3. Test the OAuth flow:');
try {
  // This will show us what the current configuration looks like
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/auth/callback',
      skipBrowserRedirect: true // This prevents actual redirect for testing
    }
  });
  
  if (data?.url) {
    console.log('   - Generated OAuth URL:', data.url);
    
    // Parse the URL to check the site_url in the state parameter
    const url = new URL(data.url);
    const state = url.searchParams.get('state');
    if (state) {
      try {
        // Decode the JWT state to see the site_url
        const payload = JSON.parse(atob(state.split('.')[1]));
        console.log('   - Site URL in state:', payload.site_url);
        console.log('   - Referrer in state:', payload.referrer);
      } catch (e) {
        console.log('   - Could not decode state parameter');
      }
    }
  }
  
  if (error) {
    console.log('   - OAuth Error:', error.message);
  }
} catch (err) {
  console.log('   - Test Error:', err.message);
}

console.log('\n✅ Next Steps:');
console.log('1. Check your Supabase dashboard Authentication settings');
console.log('2. Ensure Site URL is set to http://localhost:3000 for development');
console.log('3. Verify redirect URLs include http://localhost:3000/auth/callback');
console.log('4. If using production settings, consider using environment variables');