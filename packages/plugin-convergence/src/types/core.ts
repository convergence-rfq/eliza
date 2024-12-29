// Core interface types from docs
export interface IAgentConfig {
  get(key: string): any;
  set(key: string, value: any): void;
}

export interface IAgentRuntime {
  log(message: string): Promise<void>;
  // ... other methods from docs
}