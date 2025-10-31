/**
 * Wallet Dashboard Component
 * 
 * Provides a comprehensive interface for users to manage their cryptocurrency wallet,
 * view balances, make withdrawals, and monitor transaction history.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Send, 
  RefreshCw, 
  Copy, 
  CheckCircle, 
  TrendingUp,
  Clock,
  DollarSign
} from 'lucide-react';

interface WalletData {
  balance: string;
  availableBalance: string;
  pendingWithdrawals: string;
  walletAddress?: string;
}

interface WithdrawalData {
  withdrawalId: string;
  status: string;
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
  }>;
}

interface WalletDashboardProps {
  userId: string;
}

export default function WalletDashboard({ userId }: WalletDashboardProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<WithdrawalData | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Load wallet data
  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load wallet balance
      const balanceResponse = await fetch(`/api/wallet/balance?userId=${userId}`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setWalletData(balanceData);
      } else {
        throw new Error('Failed to load wallet balance');
      }

      // Load system status
      const statusResponse = await fetch('/api/wallet/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSystemStatus(statusData);
      }
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Create wallet if it doesn't exist
  const createWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await loadWalletData();
      } else {
        throw new Error('Failed to create wallet');
      }
    } catch (err) {
      console.error('Error creating wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      setLoading(false);
    }
  };

  // Process withdrawal
  const processWithdrawal = async () => {
    if (!withdrawalAmount || !withdrawalAddress) {
      setError('Please enter both amount and destination address');
      return;
    }

    try {
      setWithdrawalLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: withdrawalAmount,
          destinationAddress: withdrawalAddress,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setWithdrawalResult(result);
        setWithdrawalAmount('');
        setWithdrawalAddress('');
        await loadWalletData(); // Refresh balance
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }
    } catch (err) {
      console.error('Error processing withdrawal:', err);
      setError(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    if (walletData?.walletAddress) {
      try {
        await navigator.clipboard.writeText(walletData.walletAddress);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading wallet...</span>
      </div>
    );
  }

  if (error && !walletData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={createWallet} className="mt-4">
          Create Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
        <Button onClick={loadWalletData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {withdrawalResult && (
        <Alert>
          <AlertDescription>
            Withdrawal initiated successfully. Transaction ID: {withdrawalResult.withdrawalId}
            <br />
            Status: <Badge variant="outline">{withdrawalResult.status}</Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletData?.balance || '0.00'} USDT</div>
          </CardContent>
        </Card>

        {/* Available Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletData?.availableBalance || '0.00'} USDT</div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletData?.pendingWithdrawals || '0.00'} USDT</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdraw" className="space-y-4">
        <TabsList>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="address">Wallet Address</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Destination Address</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  value={withdrawalAddress}
                  onChange={(e) => setWithdrawalAddress(e.target.value)}
                />
              </div>
              <Button 
                onClick={processWithdrawal} 
                disabled={withdrawalLoading || !withdrawalAmount || !withdrawalAddress}
                className="w-full"
              >
                {withdrawalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Withdraw
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Wallet Address</CardTitle>
            </CardHeader>
            <CardContent>
              {walletData?.walletAddress ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 rounded-lg font-mono text-sm break-all">
                    {walletData.walletAddress}
                  </div>
                  <Button onClick={copyAddress} variant="outline" className="w-full">
                    {copiedAddress ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Address
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No wallet address available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              {systemStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span>Overall Status:</span>
                    <Badge 
                      variant={
                        systemStatus.overall === 'healthy' ? 'default' : 
                        systemStatus.overall === 'warning' ? 'secondary' : 'destructive'
                      }
                    >
                      {systemStatus.overall}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Services:</h4>
                    {systemStatus.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{service.name}</span>
                        <Badge 
                          variant={
                            service.status === 'running' ? 'default' : 
                            service.status === 'stopped' ? 'secondary' : 'destructive'
                          }
                        >
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">System status unavailable</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}