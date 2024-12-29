import { ICacheManager } from '@elizaos/core';
import { RFQResponse } from './types';

export class ConvergenceCache {
  private cache: ICacheManager;
  private prefix = 'convergence:';
  private readonly DEFAULT_TTL = 60; // 60 seconds

  constructor(cache: ICacheManager) {
    if (!cache) {
      throw new Error('Cache manager is required');
    }
    this.cache = cache;
  }

  async cacheQuote(quoteId: string, quote: RFQResponse, ttl: number = this.DEFAULT_TTL) {
    if (!quoteId || !quote) {
      throw new Error('Quote ID and quote data are required');
    }

    const key = this.getKey(quoteId);
    try {
      await this.cache.set(key, quote, ttl);
    } catch (error) {
      console.error(`Failed to cache quote: ${error.message}`);
      // Optionally rethrow or handle silently
    }
  }

  async getQuote(quoteId: string): Promise<RFQResponse | null> {
    if (!quoteId) {
      throw new Error('Quote ID is required');
    }

    const key = this.getKey(quoteId);
    try {
      return await this.cache.get(key);
    } catch (error) {
      console.error(`Failed to get quote from cache: ${error.message}`);
      return null;
    }
  }

  private getKey(quoteId: string): string {
    return `${this.prefix}quote:${quoteId}`;
  }
}