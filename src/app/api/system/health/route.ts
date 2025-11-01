// src/app/api/system/health/route.ts  (App router)
import { NextResponse } from 'next/server';
import { getWalletServiceManager } from '../../../../services/walletServiceManager';

export async function GET() {
  try {
    // Get wallet service manager
    const walletManager = getWalletServiceManager();
    
    if (!walletManager) {
      // Return a "warning" status instead of "critical" when services aren't initialized
      // This allows the frontend to show that services are starting up rather than completely failed
      return NextResponse.json({
        overall: 'warning',
        services: [
          {
            name: 'Wallet Service Manager',
            status: 'stopped',
            lastActivity: new Date().toISOString(),
            error: 'Services not yet initialized'
          }
        ],
        metrics: {
          timestamp: new Date().toISOString(),
          initialization: 'pending'
        },
        alerts: [],
        timestamp: new Date().toISOString(),
        message: 'Wallet services are starting up'
      }, { status: 200 });
    }

    // Check if services are initialized
    if (!walletManager.isServicesInitialized()) {
      return NextResponse.json({
        overall: 'warning',
        services: [
          {
            name: 'Wallet Service Manager',
            status: 'stopped',
            lastActivity: new Date().toISOString(),
            error: 'Services initialized but not started'
          }
        ],
        metrics: {
          timestamp: new Date().toISOString(),
          initialization: 'incomplete'
        },
        alerts: [],
        timestamp: new Date().toISOString(),
        message: 'Wallet services are initializing'
      }, { status: 200 });
    }

    // Get system health
    const health = await walletManager.getSystemHealth();

    // Format response to match what WalletServicesProvider expects
    const response = {
      overall: health.overall,
      services: health.services.map(service => ({
        ...service,
        lastActivity: service.lastActivity?.toISOString()
      })),
      metrics: health.metrics,
      alerts: health.alerts,
      timestamp: new Date().toISOString()
    };

    // Set appropriate status code based on health
    let statusCode = 200;
    if (health.overall === 'critical') {
      statusCode = 503; // Service unavailable
    }

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('❌ Health API error:', error);
    return NextResponse.json({
      overall: 'critical',
      services: [
        {
          name: 'Health Check',
          status: 'error',
          lastActivity: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      ],
      metrics: {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      alerts: [],
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 500 });
  }
}