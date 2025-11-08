import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import EmailService from '@/lib/emailService';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || '/account';
  
  console.log('🔄 Auth callback started at:', new Date().toISOString());
  console.log('📁 Redirect target:', redirectTo);
  
  if (code) {
    console.log('🔑 Auth callback - Exchanging code for session');
    
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Auth exchange error:', error);
      return NextResponse.redirect(new URL('/signin?error=AuthFailed', request.url));
    }
    
    console.log('✅ Session exchanged successfully, implementing enhanced validation...');
    
    // 🚀 ENHANCED SESSION VALIDATION - 3-second buffer with multiple retries
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second between retries
    let validSession = null;
    let validUser = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Validation attempt ${attempt}/${maxRetries}`);
      
      // Wait for session propagation
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      
      // Check session
      const { data: sessionCheck } = await supabase.auth.getSession();
      const { data: { user: userCheck } } = await supabase.auth.getUser();
      
      console.log(`📊 Attempt ${attempt} - Session:`, !!sessionCheck.session, 'User:', !!userCheck);
      
      if (sessionCheck.session && userCheck) {
        validSession = sessionCheck.session;
        validUser = userCheck;
        console.log(`✅ Session validated on attempt ${attempt}`);
        break;
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retry ${attempt} failed, waiting for next attempt...`);
      }
    }
    
    // Final validation check
    if (!validSession || !validUser) {
      console.error("❌ Session validation failed after all retries");
      return NextResponse.redirect(new URL("/signin?error=SessionValidationFailed", request.url));
    }
    
    console.log('✅ User verified:', validUser.email);
    
    // Force database connection and profile check
    try {
      const { data: profileCheck } = await supabase
        .from('onagui_profiles')
        .select('id, onagui_type')
        .eq('id', validUser.id)
        .limit(1);
      
      console.log('📋 Profile check:', profileCheck ? 'Found' : 'Not found');
    } catch (profileError) {
      console.warn('⚠️ Profile check failed:', profileError);
    }

    // 📧 Send welcome email (non-blocking) for OAuth signups
    try {
      const toEmail = validUser.email;
      const fullName = (validUser.user_metadata as any)?.full_name || (validUser.user_metadata as any)?.name || undefined;
      if (toEmail) {
        EmailService.sendWelcomeEmail(toEmail, fullName)
          .then((ok) => console.log(`📧 Welcome email ${ok ? 'sent' : 'failed'} to ${toEmail}`))
          .catch((err) => console.warn('⚠️ Welcome email error:', err));
      }
    } catch (emailErr) {
      console.warn('⚠️ Welcome email exception:', emailErr);
    }

    // 🔐 CRYPTO WALLET GENERATION - Generate wallet for OAuth signups
    try {
      console.log('🔐 Checking if user needs crypto wallet generation...');
      
      // Check if user already has a crypto wallet
      const { data: existingWallet } = await supabase
        .from('user_crypto_wallets')
        .select('id')
        .eq('user_id', validUser.id)
        .limit(1);
      
      if (!existingWallet || existingWallet.length === 0) {
        console.log('🚀 Generating crypto wallet for OAuth user:', validUser.id);
        
        // Call the wallet generation API
        const walletResponse = await fetch(`${request.nextUrl.origin}/api/wallet/generate-crypto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: validUser.id }),
        });
        
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          console.log('✅ Crypto wallet generated successfully for OAuth user');
        } else {
          console.warn('⚠️ Crypto wallet generation failed for OAuth user, but continuing...');
        }
      } else {
        console.log('✅ User already has crypto wallet, skipping generation');
      }
    } catch (walletError) {
      console.warn('⚠️ Crypto wallet generation error (non-blocking):', walletError);
      // Don't block the auth flow if wallet generation fails
    }
    
    // 🚨 ENHANCED ADMIN DETECTION - Using new schema
    const userEmail = validUser.email;
    const userId = validUser.id;
    
    // Emergency admin emails for fallback
    const emergencyAdmins = [
      process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      'richtheocrypto@gmail.com',
      'samiraeddaoudi88@gmail.com'
    ].filter(Boolean);
    
    let isAdmin = false;
    
    // Check emergency admin list first
    if (userEmail && emergencyAdmins.includes(userEmail)) {
      console.log('🚨 Emergency admin detected in callback:', userEmail);
      isAdmin = true;
    } else {
      // Check database for is_admin flag
      try {
        const { data: profile, error: profileError } = await supabase
          .from('onagui_profiles')
          .select('is_admin, onagui_type')
          .eq('id', userId)
          .single();
        
        if (!profileError && profile) {
          isAdmin = profile.is_admin === true;
          console.log(`🔍 Admin check result: is_admin=${profile.is_admin}, onagui_type=${profile.onagui_type}`);
        } else {
          console.warn('⚠️ Could not fetch profile for admin check:', profileError);
        }
      } catch (adminCheckError) {
        console.error('💥 Admin check error in callback:', adminCheckError);
      }
    }
    
    if (isAdmin) {
      console.log('🔓 Admin user detected in callback, redirecting to /admin');
      const finalTime = Date.now();
      console.log(`⏱️ Auth callback completed in ${finalTime - startTime}ms`);
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    
    console.log('👤 Regular user, redirecting to:', redirectTo);
    const finalTime = Date.now();
    console.log(`⏱️ Auth callback completed in ${finalTime - startTime}ms`);
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  
  console.log('❌ No auth code provided, redirecting to signin');
  return NextResponse.redirect(new URL('/signin', request.url));
}