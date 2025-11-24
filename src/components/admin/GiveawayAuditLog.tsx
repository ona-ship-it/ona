'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLog {
  id: string;
  giveaway_id: string;
  actor_id: string | null;
  target_id: string | null;
  action: string;
  note: string | null;
  created_at: string;
}

export function GiveawayAuditLog({ giveawayId }: { giveawayId: string }) {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      fetchAuditLogs();
    }
  }, [expanded, giveawayId]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('giveaway_audit')
      .select('*')
      .eq('giveaway_id', giveawayId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="w-full justify-between"
      >
        <span>Audit Log ({logs.length} entries)</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>

      {expanded && (
        <Card className="mt-2 border-gray-200">
          <CardContent className="p-3">
            {loading ? (
              <p className="text-sm text-gray-500">Loading audit logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-gray-500">No audit logs found.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-medium text-blue-600">
                          {formatAction(log.action)}
                        </span>
                        <p className="text-xs text-gray-500">
                          by {log.actor_id || 'System'} • {formatDate(log.created_at)}
                        </p>
                      </div>
                    </div>
                    {log.note && (
                      <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-1 rounded">
                        {log.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}