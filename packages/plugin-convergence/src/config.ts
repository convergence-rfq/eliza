import { IAgentConfig, IAgentRuntime } from '@elizaos/core';
import { register } from './index';

export const convergenceConfig = {
  name: 'convergence',
  version: '0.1.0',

  // Plugin initialization
  initialize: async (config: IAgentConfig, runtime: IAgentRuntime) => {
    // Validate required config
    const requiredFields = ['apiKey', 'apiSecret', 'endpoint', 'chainId'];
    for (const field of requiredFields) {
      const value = config.get(`convergence.${field}`);
      if (!value) {
        throw new Error(`Missing required config: convergence.${field}`);
      }
    }

    return register(config, runtime);
  },

  // Plugin capabilities
  capabilities: {
    trading: {
      getQuote: true,
      executeTrade: true
    }
  },

  // Plugin configuration schema
  configSchema: {
    apiKey: {
      type: 'string',
      required: true,
      validate: (value: string) => value.length > 0
    },
    apiSecret: {
      type: 'string',
      required: true,
      validate: (value: string) => value.length > 0
    },
    endpoint: {
      type: 'string',
      required: true,
      validate: (value: string) => /^https?:\/\/.+/.test(value)
    },
    chainId: {
      type: 'number',
      required: true,
      validate: (value: number) => value > 0
    }
  }
};