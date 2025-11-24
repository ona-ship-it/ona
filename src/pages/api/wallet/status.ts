/**
 * API Route: System Status
 * 
 * Provides comprehensive system health and service status information.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getWalletServiceManager } from '../../../services/walletServiceManager';

interface StatusResponse {
  success: boolean;
  data?: {
    overall: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'running' | 'stopped' | 'error';
      lastActivity?: string;
      error?: string;
    }>;
    metrics: any;
    alerts: any[];
    timestamp: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get wallet service manager
    const walletManager = getWalletServiceManager();
    if (!walletManager) {
      return res.status(503).json({
        success: false,
        error: 'Wallet services not initialized'
      });
    }

    // Get system health
    const health = await walletManager.getSystemHealth();

    // Format response
    const response = {
      success: true,
      data: {
        overall: health.overall,
        services: health.services.map(service => ({
          ...service,
          lastActivity: service.lastActivity?.toISOString()
        })),
        metrics: health.metrics,
        alerts: health.alerts,
        timestamp: new Date().toISOString()
      }
    };

    // Set appropriate status code based on health
    let statusCode = 200;
    if (health.overall === 'warning') {
      statusCode = 200; // Still OK, but with warnings
    } else if (health.overall === 'critical') {
      statusCode = 503; // Service unavailable
    }

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('❌ Status API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}