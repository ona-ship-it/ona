'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import GiveawayReviewCard from '@/components/admin/GiveawayReviewCard';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useWalletServices } from '@/components/WalletServicesProvider';

function ReviewPageContent() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const { isInitialized, isLoading, error, retryInitialization } = useWalletServices();
  const searchParams = useSearchParams();
  const previewEnabled = (() => {
    const flag = searchParams?.get('preview');
    return flag === '1' || flag === 'true';
  })();

  const fetchPendingGiveaways = async () => {
    // When preview is enabled, populate mock data and skip API
    if (previewEnabled) {
      setGiveaways([
        {
          id: 'mock-giveaway-001',
          title: 'Mock Giveaway: Headphones',
          description: 'Premium wireless headphones',
          prize_amount: 100,
          tickets_count: 42,
          temp_winner_id: null,
          winner_id: null,
          status: 'review_pending',
          escrow_status: 'held',
          created_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          creator_id: 'admin-mock-001',
        },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/giveaways?action=pending-review');
      const result = await response.json();
      
      if (result.success) {
        setGiveaways(result.data ?? []);
      } else {
        console.error('Failed to fetch pending giveaways:', result.error);
      }
    } catch (error) {
      console.error('Error fetching pending giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingGiveaways();
  }, [previewEnabled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">🎯 Giveaway Winner Review</h1>

      {previewEnabled && (
        <div className="rounded-md border border-dashed border-purple-300 bg-purple-50 p-3 text-sm text-purple-700">
          Preview mode is ON. Showing a mock giveaway.
        </div>
      )}

      {/* Wallet services health banner */}
      <div>
        {!isInitialized ? (
          <Alert variant={error && error.toLowerCase().includes('critical') ? 'destructive' : 'default'}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <div className="flex items-center justify-between">
              <div>
                <AlertTitle className="flex items-center gap-2">
                  Wallet Services
                  <Badge variant={
                    isLoading ? 'secondary' : (error && error.toLowerCase().includes('critical') ? 'destructive' : 'secondary')
                  }>
                    {isLoading ? 'checking' : 'warning'}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {isLoading ? 'Checking wallet services…' : (error || 'Wallet services are starting up…')}
                </AlertDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={retryInitialization} disabled={isLoading}>
                  Retry
                </Button>
              </div>
            </div>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <div className="flex items-center justify-between w-full">
              <div>
                <AlertTitle className="flex items-center gap-2">
                  Wallet Services
                  <Badge variant="default">healthy</Badge>
                </AlertTitle>
                <AlertDescription>Wallet services are running.</AlertDescription>
              </div>
            </div>
          </Alert>
        )}
      </div>
      {giveaways.length === 0 ? (
        <p className="text-gray-500">No giveaways awaiting review.</p>
      ) : (
        giveaways.map((g) => (
          <GiveawayReviewCard key={g.id} giveaway={g} refresh={fetchPendingGiveaways} />
        ))
      )}
    </div>
  );
}

export default function GiveawayReviewPage() {
  return (
    <Suspense>
      <ReviewPageContent />
    </Suspense>
  );
}