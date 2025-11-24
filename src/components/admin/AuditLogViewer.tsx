'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { GiveawayAudit } from '@/types/supabase';
import { toast } from 'sonner';

type AuditLog = GiveawayAudit;

export default function AuditLogViewer({
  giveawayId,
  open,
  onClose,
}: {
  giveawayId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<GiveawayAudit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('giveaway_audit')
        .select('*')
        .eq('giveaway_id', giveawayId)
        .order('created_at', { ascending: false })
        .limit(200);
      setLoading(false);
      if (error) {
        console.error('Failed to load audit logs', error);
        toast.error('Failed to load audit logs');
      } else if (mounted) {
        setLogs((data ?? []) as GiveawayAudit[]);
      }
    };

    fetchLogs();

    const channel = supabase
      .channel(`giveaway_audit_${giveawayId}`)
      .on(
        'postgres_changes',
        ({ event: '*', schema: 'public', table: 'giveaway_audit', filter: `giveaway_id=eq.${giveawayId}` } as any),
        (payload) => {
          // prepend newest log
          setLogs((prev) => {
            const newLog = payload.new as GiveawayAudit;
            return [newLog, ...prev].slice(0, 500);
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [open, giveawayId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-3xl rounded bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">Giveaway Audit Log</h3>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => {
                // export currently loaded logs as JSON
                const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `giveaway_audit_${giveawayId}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Exported audit logs (JSON)');
              }}
            >
              Export JSON
            </button>
            <button
              className="px-3 py-1 text-sm rounded bg-red-50 hover:bg-red-100"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
          {loading && <div className="text-sm text-gray-500">Loading logs…</div>}
          {!loading && logs.length === 0 && (
            <div className="text-sm text-gray-500">No audit entries yet.</div>
          )}
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded border p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{log.action}</div>
                    <div className="text-xs text-gray-500">
                      {log.actor_id ? `By: ${log.actor_id}` : 'By: system'}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : '-'}
                  </div>
                </div>
                {log.note && (
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {log.note}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}