import { NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/utils/supabase/server';
import createServiceClient from '@/utils/supabase/server-side-service';

export async function POST(req: Request) {
  try {
    // Verify authenticated user via cookies/session
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Prepare upload path and contents
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const filePath = `giveaway-photos/${fileName}`;

    // Use service role client to bypass RLS for storage upload
    const service = createServiceClient();
    const { error: uploadError } = await service.storage
      .from('giveaways')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data } = service.storage
      .from('giveaways')
      .getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl, path: filePath });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 });
  }
}