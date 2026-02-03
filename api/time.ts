// api/time.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BinanceClient } from './_lib/binance';
import { validateDashboardToken, validateTestnetOnly } from './_lib/validate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate dashboard token if required
    if (!validateDashboardToken(req)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing dashboard token' });
    }

    // Validate testnet-only
    const testnetValidation = validateTestnetOnly();
    if (!testnetValidation.valid) {
      return res.status(400).json(testnetValidation.error);
    }

    // Create Binance client and test connectivity
    const client = new BinanceClient();
    const timeData = await client.testConnectivity();

    return res.status(200).json({
      serverTime: timeData.serverTime,
      baseUrl: client.getBaseUrl()
    });

  } catch (error: any) {
    console.error('[API /time] Error:', error);
    
    return res.status(502).json({
      error: 'Failed to connect to Binance',
      message: error.message || 'Network error'
    });
  }
}
