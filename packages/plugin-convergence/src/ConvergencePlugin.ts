import { IAgentConfig, IAgentRuntime } from '@elizaos/core';
import { ConvergenceService } from './services/ConvergenceService';
import {
  ConvergenceConfig,
  QuoteRequest,
  TradeParams,
  CollateralRequest,
  ConfirmRFQResponse,
  CreateRFQRequest,
  SettlementRequest
} from './types';

export class ConvergencePlugin {
  private service: ConvergenceService;

  constructor(config: IAgentConfig, runtime: IAgentRuntime) {
    const convergenceConfig: ConvergenceConfig = {
      apiKey: runtime.getSetting('convergence.apiKey') || '',
      apiSecret: runtime.getSetting('convergence.apiSecret') || '',
      endpoint: runtime.getSetting('convergence.endpoint') || '',
      chainId: Number(runtime.getSetting('convergence.chainId') || 0)
    };

    this.service = new ConvergenceService(convergenceConfig, runtime);
  }

  // High-level business logic
  async createAndMonitorRFQ(request: CreateRFQRequest) {
    const rfq = await this.service.makeRFQRequest('/api/rfqs', request);
    // Add business logic like monitoring, retrying, etc.
    return rfq;
  }

  async findBestQuote(tokenIn: string, tokenOut: string, amount: string) {
    // Business logic to find best quote
    const rfqs = await this.service.fetchRFQData('/api/rfqs');
    // Add logic to filter, compare prices, etc.
    return rfqs[0];
  }

  // Core RFQ Operations
  async createRFQ(request: CreateRFQRequest) {
    return this.service.createRFQ(request);
  }

  async getRFQById(rfqId: string) {
    return this.service.getRFQById(rfqId);
  }

  async getAllRFQs() {
    return this.service.getAllRFQs();
  }

  async cancelRFQ(rfqId: string) {
    return this.service.cancelRFQ(rfqId);
  }

  async getRFQOrders(rfqId: string) {
    return this.service.getRFQOrders(rfqId);
  }

  async confirmRFQResponse(rfqId: string, params: ConfirmRFQResponse) {
    return this.service.confirmRFQResponse(rfqId, params);
  }

  // Quote and Trade Operations
  async getQuote(request: QuoteRequest) {
    return this.service.requestQuote(request);
  }

  async executeTrade(params: TradeParams) {
    return this.service.executeTrade(params);
  }

  async settleRFQ(params: SettlementRequest) {
    return this.service.settleRFQ(params);
  }

  // Collateral Management
  async getCollateralAccount() {
    return this.service.getCollateralAccount();
  }

  async createCollateralAccount() {
    return this.service.createCollateralAccount();
  }

  async depositCollateral(request: CollateralRequest) {
    return this.service.depositCollateral(request);
  }

  async withdrawCollateral(request: CollateralRequest) {
    return this.service.withdrawCollateral(request);
  }

  // Order Management
  async getOrders() {
    return this.service.getOrders();
  }
}