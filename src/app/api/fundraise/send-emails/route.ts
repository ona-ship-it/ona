import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';
import { sendFundraiserEmail, FundraiserEmailType, FundraiserEmailData } from '@/lib/email';

export const dynamic = 'force-dynamic';

// This endpoint processes pending email notifications
// Can be called manually or via cron job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // Get pending email notifications (limit to 50 per batch)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ message: 'No pending emails', sent: 0 });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each email
    for (const emailNotif of pendingEmails) {
      try {
        const emailData: FundraiserEmailData = emailNotif.data || {};
        
        const result = await sendFundraiserEmail(
          emailNotif.email,
          emailNotif.type as FundraiserEmailType,
          emailData
        );

        if (result.success) {
          // Update email status to sent
          await supabase
            .from('email_notifications')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', emailNotif.id);

          results.sent++;
        } else {
          // Mark as failed
          await supabase
            .from('email_notifications')
            .update({
              status: 'failed',
              failed_reason: result.error?.toString() || 'Unknown error',
              updated_at: new Date().toISOString(),
            })
            .eq('id', emailNotif.id);

          results.failed++;
          results.errors.push({
            id: emailNotif.id,
            error: result.error,
          });
        }
      } catch (error) {
        console.error(`Failed to process email ${emailNotif.id}:`, error);
        results.failed++;
        results.errors.push({
          id: emailNotif.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Mark as failed in database
        await supabase
          .from('email_notifications')
          .update({
            status: 'failed',
            failed_reason: error instanceof Error ? error.message : 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', emailNotif.id);
      }
    }

    return NextResponse.json({
      message: 'Email processing complete',
      ...results,
    });
  } catch (error) {
    console.error('Email processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check email queue status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    const { data: stats, error } = await supabase
      .from('email_notifications')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        
        const counts = {
          pending: 0,
          sent: 0,
          failed: 0,
          bounced: 0,
        };
        
        result.data?.forEach((email: any) => {
          counts[email.status as keyof typeof counts]++;
        });
        
        return { data: counts, error: null };
      });

    if (error) {
      throw error;
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
