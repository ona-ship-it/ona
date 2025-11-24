'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import WalletDashboard from '@/components/WalletDashboard';
import { useWalletServices } from '@/components/WalletServicesProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WalletClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isInitialized, isLoading: servicesLoading, error: servicesError } = useWalletServices();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          setError('Failed to get user information');
          return;
        }

        if (!user) {
          setError('Please sign in to access your wallet');
          return;
        }

        setUser(user);
      } catch (err) {
        setError('An error occurred while loading user data');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to access your wallet.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (servicesLoading) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Initializing wallet services...</span>
        </div>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Wallet services are currently unavailable: {servicesError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Wallet</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Wallet services are not initialized. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Cryptocurrency Wallet</h1>
      <WalletDashboard userId={user.id} />
    </div>
  );
}