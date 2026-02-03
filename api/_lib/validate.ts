// api/_lib/validate.ts

import { OrderRequest, APIError } from './types';

export function validateOrderRequest(body: any): { valid: boolean; error?: APIError; data?: OrderRequest } {
  // Check required fields
  if (!body.symbol || typeof body.symbol !== 'string') {
    return {
      valid: false,
      error: { error: 'Symbol is required and must be a string' }
    };
  }

  if (!body.side || !['BUY', 'SELL'].includes(body.side.toUpperCase())) {
    return {
      valid: false,
      error: { error: 'Side must be BUY or SELL' }
    };
  }

  if (!body.type || !['MARKET', 'LIMIT', 'STOP'].includes(body.type.toUpperCase())) {
    return {
      valid: false,
      error: { error: 'Type must be MARKET, LIMIT, or STOP' }
    };
  }

  if (!body.quantity || typeof body.quantity !== 'number' || body.quantity <= 0) {
    return {
      valid: false,
      error: { error: 'Quantity must be a number greater than 0' }
    };
  }

  // Validate symbol format
  const symbol = body.symbol.toUpperCase().trim();
  if (!symbol.endsWith('USDT')) {
    return {
      valid: false,
      error: { error: 'Symbol must end with USDT for USDT-M futures' }
    };
  }

  const orderType = body.type.toUpperCase();

  // LIMIT order validation
  if (orderType === 'LIMIT') {
    if (!body.price || typeof body.price !== 'number' || body.price <= 0) {
      return {
        valid: false,
        error: { error: 'Price is required for LIMIT orders and must be greater than 0' }
      };
    }
  }

  // STOP order validation
  if (orderType === 'STOP') {
    if (!body.price || typeof body.price !== 'number' || body.price <= 0) {
      return {
        valid: false,
        error: { error: 'Price is required for STOP orders and must be greater than 0' }
      };
    }
    if (!body.stopPrice || typeof body.stopPrice !== 'number' || body.stopPrice <= 0) {
      return {
        valid: false,
        error: { error: 'Stop price is required for STOP orders and must be greater than 0' }
      };
    }
  }

  // MARKET order should not have price/stopPrice
  if (orderType === 'MARKET') {
    if (body.price || body.stopPrice) {
      // Warn and ignore (could also error)
      console.log('Warning: MARKET order should not have price/stopPrice, ignoring');
    }
  }

  const validatedOrder: OrderRequest = {
    symbol,
    side: body.side.toUpperCase(),
    type: orderType as 'MARKET' | 'LIMIT' | 'STOP',
    quantity: body.quantity,
    dryRun: body.dryRun === true
  };

  if (orderType === 'LIMIT' || orderType === 'STOP') {
    validatedOrder.price = body.price;
  }

  if (orderType === 'STOP') {
    validatedOrder.stopPrice = body.stopPrice;
  }

  return {
    valid: true,
    data: validatedOrder
  };
}

export function validateDashboardToken(request: Request): boolean {
  const requiredToken = process.env.DASHBOARD_TOKEN;
  
  // If no token is configured, allow all requests
  if (!requiredToken) {
    return true;
  }

  const providedToken = request.headers.get('X-DASHBOARD-TOKEN');
  
  return providedToken === requiredToken;
}

export function validateTestnetOnly(): { valid: boolean; error?: APIError; baseUrl?: string } {
  const baseUrl = process.env.BINANCE_BASE_URL || 'https://testnet.binancefuture.com';
  
  if (!baseUrl.includes('testnet')) {
    return {
      valid: false,
      error: {
        error: 'Security violation: BINANCE_BASE_URL must contain "testnet". This dashboard only works with testnet.'
      }
    };
  }

  return {
    valid: true,
    baseUrl
  };
}
