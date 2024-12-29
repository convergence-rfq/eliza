import { IAgentRuntime } from '@elizaos/core';
import axios from 'axios';
import { ethers } from 'ethers';
import { ConvergenceConfig, QuoteRequest, RFQResponse, TradeParams, CollateralAccount, CollateralRequest, RFQDetails, SettlementRequest, CreateRFQRequest, ConfirmRFQResponse, RFQOrder } from './types';

// Add error type helper
interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export class ConvergenceService {
  private config: ConvergenceConfig;
  private runtime: IAgentRuntime;

  constructor(config: ConvergenceConfig, runtime: IAgentRuntime) {
    this.config = config;
    this.runtime = runtime;
  }

  async requestQuote(params: QuoteRequest): Promise<RFQResponse> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post<RFQResponse>(
        `${this.config.endpoint}/v1/quote`,
        params,
        { headers }
      );

      if (!response.data) {
        throw new Error('Invalid quote response');
      }

      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Quote request failed: ${errorMessage}`);
      throw error;
    }
  }

  async executeTrade(params: TradeParams) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post<{success: boolean; txHash?: string}>(
        `${this.config.endpoint}/v1/trade`,
        params,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Trade execution failed: ${errorMessage}`);
      throw error;
    }
  }

  private getAuthHeaders() {
    const timestamp = Date.now();
    const signature = this.generateSignature(timestamp);

    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    return {
      'X-API-Key': this.config.apiKey,
      'X-Timestamp': timestamp.toString(),
      'X-Signature': signature
    };
  }

  private generateSignature(timestamp: number): string {
    const message = `${timestamp}${this.config.apiSecret}`;
    return ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(message)
    );
  }

  // Collateral Management
  async getCollateralAccount(): Promise<CollateralAccount> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get<CollateralAccount>(
        `${this.config.endpoint}/api/collateral/account`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to get collateral account: ${errorMessage}`);
      throw error;
    }
  }

  async createCollateralAccount(): Promise<CollateralAccount> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post<CollateralAccount>(
        `${this.config.endpoint}/api/collateral/account`,
        {},
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to create collateral account: ${errorMessage}`);
      throw error;
    }
  }

  async depositCollateral(request: CollateralRequest) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post(
        `${this.config.endpoint}/api/collateral/fund`,
        request,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to deposit collateral: ${errorMessage}`);
      throw error;
    }
  }

  async withdrawCollateral(request: CollateralRequest) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post(
        `${this.config.endpoint}/api/collateral/withdraw`,
        request,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to withdraw collateral: ${errorMessage}`);
      throw error;
    }
  }

  // RFQ Operations
  async getRFQById(rfqId: string): Promise<RFQDetails> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get<RFQDetails>(
        `${this.config.endpoint}/api/rfqs/${rfqId}`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to get RFQ details: ${errorMessage}`);
      throw error;
    }
  }

  async cancelRFQ(rfqId: string): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      await axios.delete(
        `${this.config.endpoint}/api/rfqs/${rfqId}`,
        { headers }
      );
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to cancel RFQ: ${errorMessage}`);
      throw error;
    }
  }

  async getRFQOrders(rfqId: string): Promise<RFQOrder[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get<RFQOrder[]>(
        `${this.config.endpoint}/api/rfqs/${rfqId}/orders`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to get RFQ orders: ${errorMessage}`);
      throw error;
    }
  }

  async confirmRFQResponse(rfqId: string, params: ConfirmRFQResponse): Promise<RFQResponse> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.put<RFQResponse>(
        `${this.config.endpoint}/api/rfqs/${rfqId}/orders`,
        params,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to confirm RFQ response: ${errorMessage}`);
      throw error;
    }
  }

  async getAllRFQs(): Promise<RFQDetails[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get<RFQDetails[]>(
        `${this.config.endpoint}/api/rfqs`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to get all RFQs: ${errorMessage}`);
      throw error;
    }
  }

  async createRFQ(request: CreateRFQRequest): Promise<RFQDetails> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post<RFQDetails>(
        `${this.config.endpoint}/api/rfqs`,
        request,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to create RFQ: ${errorMessage}`);
      throw error;
    }
  }

  async settleRFQ(params: SettlementRequest) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.put(
        `${this.config.endpoint}/api/rfq/settle`,
        params,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to settle RFQ: ${errorMessage}`);
      throw error;
    }
  }

  async getOrders() {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(
        `${this.config.endpoint}/api/orders`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      this.runtime.log(`Failed to get orders: ${errorMessage}`);
      throw error;
    }
  }
}