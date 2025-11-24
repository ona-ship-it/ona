'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SessionTestPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('onagui_profiles')
        .select('onagui_type, is_admin')
        .eq('id', user?.id || '')
        .single();
      
      const { data: isAdmin } = await supabase.rpc('is_admin_user', {
        user_uuid: user?.id || ''
      });

      setSessionInfo({
        user: user ? { email: user.email, id: user.id } : null,
        profile,
        isAdmin,
        timestamp: new Date().toISOString(),
        cookies: document.cookie
      });
    };

    checkSession();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Session Test Page</h1>
      <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
      
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => window.location.href = '/admin'}
          style={{ padding: '10px 20px', marginRight: '10px' }}
        >
          Test /admin Access
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px' }}
        >
          Reload Session Test
        </button>
      </div>
    </div>
  );
}