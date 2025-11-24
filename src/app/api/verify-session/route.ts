import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      user: null,
      error: error.message || 'Failed to verify session',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}