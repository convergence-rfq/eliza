import { IAgentConfig, IAgentRuntime } from '@elizaos/core';
import { ConvergencePlugin } from './index';

class TestConfig implements IAgentConfig {
  private config: Record<string, any> = {
    'convergence.apiKey': 'your-api-key',
    'convergence.apiSecret': 'your-api-secret',
    'convergence.endpoint': 'https://api.convergence.test',
    'convergence.chainId': 1
  };

  get(key: string): any {
    return this.config[key];
  }

  set(key: string, value: any): void {
    this.config[key] = value;
  }
}

class TestRuntime implements IAgentRuntime {
  private logs: string[] = [];

  async log(message: string): Promise<void> {
    console.log(message);
    this.logs.push(message);
  }

  // Add required methods
  async initialize(): Promise<void> {
    // Implementation
  }

  async shutdown(): Promise<void> {
    // Implementation
  }

  getLogs(): string[] {
    return this.logs;
  }
}

async function testConvergencePlugin() {
  const config = new TestConfig();
  const runtime = new TestRuntime();

  const plugin = new ConvergencePlugin(config, runtime);

  try {
    // Test invalid config
    try {
      config.set('convergence.apiKey', '');
      await plugin.getQuote({
        tokenIn: '0x...',
        tokenOut: '0x...',
        amount: '1000000000000000000',
        side: 'SELL'
      });
    } catch (error) {
      console.log('Successfully caught invalid config error');
    }

    // Reset config
    config.set('convergence.apiKey', 'your-api-key');

    // Test quote request
    const quote = await plugin.getQuote({
      tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      amount: '1000000000000000000',
      side: 'SELL'
    });

    console.log('Received quote:', quote);

    // Validate quote
    if (!quote.quoteId || !quote.signature) {
      throw new Error('Invalid quote response');
    }

    // Test trade execution
    const trade = await plugin.executeTrade({
      quoteId: quote.quoteId,
      signature: quote.signature,
      deadline: Math.floor(Date.now() / 1000) + 300
    });

    console.log('Trade executed:', trade);

    // Test collateral account creation
    const account = await plugin.createCollateralAccount();
    console.log('Created collateral account:', account);

    // Test get collateral account
    const collateral = await plugin.getCollateralAccount();
    console.log('Collateral account:', collateral);

    // Test deposit collateral
    const deposit = await plugin.depositCollateral({
      amount: '1000000000000000000', // 1 ETH
      currency: 'ETH'
    });
    console.log('Deposit result:', deposit);

    // Test get orders
    const orders = await plugin.getOrders();
    console.log('Orders:', orders);

    // Test RFQ settlement
    if (orders.length > 0) {
      const settlement = await plugin.settleRFQ({
        rfqId: orders[0].rfqId,
        responseId: orders[0].responseId,
        signature: orders[0].signature
      });
      console.log('Settlement result:', settlement);
    }

    // Test create RFQ
    const newRFQ = await plugin.createRFQ({
      tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenOut: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      amount: '1000000000000000000',
      side: 'SELL'
    });
    console.log('Created RFQ:', newRFQ);

    // Test get RFQ by ID
    const rfq = await plugin.getRFQById(newRFQ.id);
    console.log('Retrieved RFQ:', rfq);

    // Test get RFQ orders
    const rfqOrders = await plugin.getRFQOrders(newRFQ.id);
    console.log('RFQ orders:', rfqOrders);

    // Test confirm RFQ response
    if (rfqOrders.length > 0) {
      const confirmation = await plugin.confirmRFQResponse(newRFQ.id, {
        rfqId: newRFQ.id,
        responseAccount: rfqOrders[0].maker,
        responseSide: 'BUY'
      });
      console.log('RFQ response confirmed:', confirmation);
    }

    // Test get all RFQs
    const allRFQs = await plugin.getAllRFQs();
    console.log('All RFQs:', allRFQs);

    // Test cancel RFQ
    await plugin.cancelRFQ(newRFQ.id);
    console.log('RFQ cancelled successfully');

  } catch (error) {
    console.error('Error testing Convergence plugin:', error);
    process.exit(1);
  }
}

// Run the test
testConvergencePlugin();