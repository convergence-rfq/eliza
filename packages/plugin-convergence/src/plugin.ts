import { IAgentConfig, IAgentRuntime } from '@elizaos/core';
import { ConvergencePlugin } from './ConvergencePlugin';

export const convergencePlugin = {
  name: 'convergence',
  version: '0.1.0',

  initialize: async (config: IAgentConfig, runtime: IAgentRuntime) => {
    return new ConvergencePlugin(config, runtime);
  },

  capabilities: {
    trading: {
      createRFQ: true,
      monitorRFQ: true,
      findBestQuote: true,
      executeTrade: true
    }
  }
};

export default convergencePlugin;