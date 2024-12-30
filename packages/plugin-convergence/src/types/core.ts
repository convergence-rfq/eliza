// Core interface types from docs
export interface IAgentConfig {
  get(key: string): any;
  set(key: string, value: any): void;
}

export interface IAgentRuntime {
  log(message: string): Promise<void>;
  // ... other methods from docs
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export interface ConvergenceConfig {
  apiKey: string;
  apiSecret: string;
  endpoint: string;
  chainId: number;
}

export interface RFQResponse {
  // Add RFQ response fields
}

export interface TradeParams {
  // Add trade params fields
}

export interface CollateralAccount {
  // Add collateral account fields
}