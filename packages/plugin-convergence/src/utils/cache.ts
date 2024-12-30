import { ICacheManager } from '@elizaos/core';
import { RFQResponse } from '../types';

export class QuoteCache {
  constructor(private cacheManager: ICacheManager) {}

  async cacheQuote(key: string, quote: RFQResponse) {
    try {
      await this.cacheManager.set(key, JSON.stringify(quote), 60); // 60 second TTL
    } catch (error) {
      // Type the error
      const err = error as Error;
      console.error(`Failed to cache quote: ${err.message}`);
    }
  }
}