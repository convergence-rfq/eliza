import { IAgentRuntime } from '@elizaos/core';
import axios from 'axios';
import { ethers } from 'ethers';
import { ConvergenceConfig } from '../types';

export class ConvergenceService {
  constructor(
    private readonly config: ConvergenceConfig,
    private readonly runtime: IAgentRuntime
  ) {}

  // Raw API calls without business logic
  async makeRFQRequest(endpoint: string, data: any) {
    const headers = this.getAuthHeaders();
    const response = await axios.post(`${this.config.endpoint}${endpoint}`, data, { headers });
    return response.data;
  }

  async fetchRFQData(endpoint: string) {
    const headers = this.getAuthHeaders();
    const response = await axios.get(`${this.config.endpoint}${endpoint}`, { headers });
    return response.data;
  }

  // ... other low-level API methods
}