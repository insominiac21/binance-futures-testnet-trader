// api/place-order.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BinanceClient } from './_lib/binance';
import { validateOrderRequest, validateDashboardToken, validateTestnetOnly } from './_lib/validate';
import { BinanceOrderParams } from './_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Validate request body
    const validation = validateOrderRequest(req.body);
    if (!validation.valid || !validation.data) {
      return res.status(400).json(validation.error);
    }

    const orderRequest = validation.data;

    // Handle dry run
    if (orderRequest.dryRun) {
      return res.status(200).json({
        dryRun: true,
        request: orderRequest,
        message: 'Dry run completed. Order was not sent to exchange.'
      });
    }

    // Build Binance order parameters
    const params: BinanceOrderParams = {
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      type: orderRequest.type,
      quantity: String(orderRequest.quantity),
      timestamp: Date.now(),
      recvWindow: 5000
    };

    // Add price for LIMIT orders
    if (orderRequest.type === 'LIMIT') {
      if (!orderRequest.price) {
        return res.status(400).json({ error: 'Price is required for LIMIT orders' });
      }
      params.price = String(orderRequest.price);
      params.timeInForce = 'GTC';
    }

    // Add price and stopPrice for STOP orders
    if (orderRequest.type === 'STOP') {
      if (!orderRequest.price || !orderRequest.stopPrice) {
        return res.status(400).json({ error: 'Price and stopPrice are required for STOP orders' });
      }
      params.price = String(orderRequest.price);
      params.stopPrice = String(orderRequest.stopPrice);
      params.timeInForce = 'GTC';
    }

    // Place order via Binance
    const client = new BinanceClient();
    
    try {
      const binanceResponse = await client.placeOrder(params);
      const normalized = client.normalizeOrderResponse(binanceResponse);

      return res.status(200).json(normalized);

    } catch (binanceError: any) {
      // Handle Binance API errors
      if (binanceError.status && binanceError.data) {
        const errorData = binanceError.data;
        
        return res.status(binanceError.status >= 500 ? 502 : 400).json({
          code: errorData.code,
          msg: errorData.msg,
          error: `Binance API Error ${errorData.code}: ${errorData.msg}`
        });
      }

      throw binanceError;
    }

  } catch (error: any) {
    console.error('[API /place-order] Unexpected error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred'
    });
  }
}
