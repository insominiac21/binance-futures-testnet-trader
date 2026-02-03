// api/_lib/binance.ts

import { createHmac } from 'crypto';
import { BinanceOrderParams, BinanceOrderResponse, NormalizedOrderResponse, BinanceError } from './types';

export class BinanceClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';
    this.baseUrl = process.env.BINANCE_BASE_URL || 'https://testnet.binancefuture.com';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET must be set in environment variables');
    }
  }

  private generateSignature(queryString: string): string {
    return createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private signParams(params: Record<string, any>): string {
    // Add timestamp and recvWindow
    const signedParams = {
      ...params,
      timestamp: Date.now(),
      recvWindow: 5000
    };

    // Create query string
    const queryString = Object.entries(signedParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    // Generate signature
    const signature = this.generateSignature(queryString);

    // Return full query string with signature
    return `${queryString}&signature=${signature}`;
  }

  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    const sanitized = { ...params };
    if (sanitized.signature) {
      sanitized.signature = '[REDACTED]';
    }
    return sanitized;
  }

  async testConnectivity(): Promise<{ serverTime: number }> {
    const url = `${this.baseUrl}/fapi/v1/time`;
    
    console.log(`[Binance] GET ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Binance] Server time: ${data.serverTime}`);
    
    return data;
  }

  async placeOrder(params: BinanceOrderParams): Promise<BinanceOrderResponse> {
    const endpoint = '/fapi/v1/order';
    const url = `${this.baseUrl}${endpoint}`;

    // Remove signature from params for signing
    const { signature, ...paramsToSign } = params;

    // Sign the request
    const queryString = this.signParams(paramsToSign);

    console.log(`[Binance] POST ${endpoint}`);
    console.log(`[Binance] Params:`, this.sanitizeParams(paramsToSign));

    const response = await fetch(`${url}?${queryString}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    console.log(`[Binance] Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[Binance] Error:`, data);
      throw {
        status: response.status,
        data: data as BinanceError
      };
    }

    console.log(`[Binance] Order placed: ${data.orderId}`);
    
    return data as BinanceOrderResponse;
  }

  normalizeOrderResponse(binanceResponse: BinanceOrderResponse): NormalizedOrderResponse {
    const normalized: NormalizedOrderResponse = {
      orderId: binanceResponse.orderId,
      symbol: binanceResponse.symbol,
      status: binanceResponse.status,
      side: binanceResponse.side,
      type: binanceResponse.type,
      quantity: binanceResponse.origQty,
      executedQty: binanceResponse.executedQty,
      avgPrice: binanceResponse.avgPrice || '0.00'
    };

    if (binanceResponse.price && binanceResponse.price !== '0' && binanceResponse.price !== '0.00') {
      normalized.price = binanceResponse.price;
    }

    if (binanceResponse.stopPrice && binanceResponse.stopPrice !== '0' && binanceResponse.stopPrice !== '0.00') {
      normalized.stopPrice = binanceResponse.stopPrice;
    }

    return normalized;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
