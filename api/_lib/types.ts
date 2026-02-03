// api/_lib/types.ts

export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  price?: number;
  stopPrice?: number;
  dryRun?: boolean;
}

export interface BinanceOrderParams {
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price?: string;
  stopPrice?: string;
  timeInForce?: string;
  timestamp: number;
  recvWindow: number;
  signature?: string;
}

export interface BinanceOrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  clientOrderId: string;
  price: string;
  avgPrice: string;
  origQty: string;
  executedQty: string;
  cumQty: string;
  cumQuote: string;
  timeInForce: string;
  type: string;
  reduceOnly: boolean;
  closePosition: boolean;
  side: string;
  positionSide: string;
  stopPrice: string;
  workingType: string;
  priceProtect: boolean;
  origType: string;
  updateTime: number;
}

export interface NormalizedOrderResponse {
  orderId: number;
  symbol: string;
  status: string;
  side: string;
  type: string;
  quantity: string;
  executedQty: string;
  avgPrice: string;
  price?: string;
  stopPrice?: string;
}

export interface BinanceError {
  code: number;
  msg: string;
}

export interface APIError {
  error: string;
  code?: number;
  msg?: string;
}
