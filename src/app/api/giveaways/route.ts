import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: giveaways, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching giveaways:', error);
      return NextResponse.json(
        { error: 'Failed to fetch giveaways' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giveaways });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}