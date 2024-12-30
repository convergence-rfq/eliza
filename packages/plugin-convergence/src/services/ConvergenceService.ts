import { IAgentRuntime, elizaLogger } from '@elizaos/core';
import axios from 'axios';
import { ethers } from 'ethers';
import {
  ConvergenceConfig,
  CreateRFQRequest,
  QuoteRequest,
  RFQResponse,
  ApiError,
  TradeParams,
  CollateralAccount,
  CollateralRequest,
  RFQDetails,
  SettlementRequest,
  ConfirmRFQResponse,
  RFQOrder
} from '../types';

export class ConvergenceService {
  constructor(
    private readonly config: ConvergenceConfig,
    private readonly runtime: IAgentRuntime
  ) {}

  // Raw API calls without business logic
  async makeRFQRequest(endpoint: string, data: any) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post(`${this.config.endpoint}${endpoint}`, data, { headers });
      elizaLogger.log(`RFQ request successful: ${endpoint}`);
      return response.data;
    } catch (error) {
      elizaLogger.error(`RFQ request failed: ${error}`);
      throw error;
    }
  }

  async fetchRFQData(endpoint: string) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get(`${this.config.endpoint}${endpoint}`, { headers });
      elizaLogger.log(`RFQ data fetch successful: ${endpoint}`);
      return response.data;
    } catch (error) {
      elizaLogger.error(`RFQ data fetch failed: ${error}`);
      throw error;
    }
  }

  private generateSignature(timestamp: number): string {
    const message = `${timestamp}${this.config.apiSecret}`;
    return ethers.keccak256(ethers.toUtf8Bytes(message));
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

  // Add all the methods that ConvergencePlugin uses
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
      await this.logError('Quote request failed', error);
      throw error;
    }
  }

  // ... other low-level API methods

  // RFQ Operations
  async getAllRFQs(): Promise<RFQDetails[]> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get<RFQDetails[]>(
        `${this.config.endpoint}/api/rfqs`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      await this.logError('Failed to get all RFQs', error);
      throw error;
    }
  }

  async getRFQById(rfqId: string): Promise<RFQDetails> {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.get<RFQDetails>(
        `${this.config.endpoint}/api/rfqs/${rfqId}`,
        { headers }
      );
      return response.data;
    } catch (error: unknown) {
      await this.logError('Failed to get RFQ details', error);
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
      await this.logError('Failed to create RFQ', error);
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
      await this.logError('Failed to cancel RFQ', error);
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
      await this.logError('Failed to get RFQ orders', error);
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
      elizaLogger.log(`RFQ response confirmed for ${rfqId}`);
      return response.data;
    } catch (error) {
      elizaLogger.error(`Failed to confirm RFQ response: ${error}`);
      throw error;
    }
  }

  async executeTrade(params: TradeParams) {
    try {
      const headers = this.getAuthHeaders();
      const response = await axios.post(
        `${this.config.endpoint}/api/trade`,
        params,
        { headers }
      );
      elizaLogger.log('Trade executed successfully');
      return response.data;
    } catch (error) {
      elizaLogger.error(`Failed to execute trade: ${error}`);
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
      elizaLogger.log('RFQ settled successfully');
      return response.data;
    } catch (error) {
      elizaLogger.error(`Failed to settle RFQ: ${error}`);
      throw error;
    }
  }

  // Collateral Operations
  async getCollateralAccount(): Promise<CollateralAccount> {
    try {
      const result = await this.fetchRFQData('/api/collateral/account');
      elizaLogger.log('Retrieved collateral account');
      return result;
    } catch (error) {
      elizaLogger.error(`Failed to get collateral account: ${error}`);
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
      elizaLogger.log('Created collateral account');
      return response.data;
    } catch (error) {
      elizaLogger.error(`Failed to create collateral account: ${error}`);
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
      elizaLogger.log('Collateral deposited successfully');
      return response.data;
    } catch (error) {
      elizaLogger.error(`Failed to deposit collateral: ${error}`);
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
      elizaLogger.log('Collateral withdrawn successfully');
      return response.data;
    } catch (error) {
      elizaLogger.error(`Failed to withdraw collateral: ${error}`);
      throw error;
    }
  }

  async getOrders() {
    try {
      return this.fetchRFQData('/api/orders');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
      elizaLogger.error(`Failed to get orders: ${errorMessage}`);
      throw error;
    }
  }

  private async logError(message: string, error: unknown) {
    const apiError = error as ApiError;
    const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
    elizaLogger.error(`${message}: ${errorMessage}`);
  }
}