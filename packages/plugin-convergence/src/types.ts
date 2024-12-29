import { IAgentConfig, IAgentRuntime } from '@elizaos/core';

export interface ConvergenceConfig {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  chainId: number;
}

export interface QuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  side: 'BUY' | 'SELL';
}

export interface RFQResponse {
  success: boolean;
  orderId?: string;
}

export interface TradeParams {
  quoteId: string;
  signature: string;
  deadline: number;
}

export interface CollateralAccount {
  address: string;
  balance: string;
  currency: string;
}

export interface CollateralRequest {
  amount: string;
  currency: string;
}

export interface RFQDetails {
  id: string;
  status: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  responses: Array<{
    id: string;
    price: string;
    signature: string;
  }>;
}

export interface SettlementRequest {
  rfqId: string;
  responseId: string;
  signature: string;
}

export interface CreateRFQRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  side: 'BUY' | 'SELL';
  validUntil?: number;
}

export interface ConfirmRFQResponse {
  rfqId: string;
  responseAccount: string;
  responseSide: 'BUY' | 'SELL';
}

export interface RFQOrder {
  id: string;
  rfqId: string;
  maker: string;
  price: string;
  signature: string;
  status: string;
}