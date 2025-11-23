import { NextResponse } from 'next/server';
import { getInitializedWalletManager, isWalletServicesInitialized } from '@/lib/walletStartup';

export async function GET() {
  try {
    const initialized = isWalletServicesInitialized();
    const manager = getInitializedWalletManager();

    if (initialized && manager) {
      const health = await manager.getSystemHealth();
      const statusCode = health.overall === 'critical' ? 503 : 200;
      return NextResponse.json(health, { status: statusCode });
    }

    // Services not initialized yet – report warning to avoid hard errors in UI
    return NextResponse.json({
      overall: 'warning',
      message: 'Wallet services are not initialized yet',
      services: [],
      metrics: { timestamp: new Date().toISOString() },
      alerts: []
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      overall: 'critical',
      error: err?.message || 'Health check failed',
      services: [],
      metrics: {},
      alerts: []
    }, { status: 503 });
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
