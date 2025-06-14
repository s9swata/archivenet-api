import { describe, it, expect } from 'vitest';
import axios from 'axios';
import crypto from 'crypto';

describe('apiKeyRouter', () => {

  it('should create an API key and return 201', async () => {
    const userId = crypto.randomUUID();
    const contract_tx_id = crypto.randomUUID();
    const res = await axios
      .post('http://localhost:8080/apiKey/create', {
        userId, name: 'Test Key', description: 'Test Desc', contract_tx_id
      });

    expect(res.status).toBe(201);
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('apiKey');
    expect(res.data.apiKey).toHaveProperty('keyHash');
  });

  it('should use default name and description if not provided', async () => {
    const userId = crypto.randomUUID();
    const contract_tx_id = crypto.randomUUID();
    const res = await axios
      .post('http://localhost:8080/apiKey/create', { userId, contract_tx_id });

    expect(res.status).toBe(201);
    expect(res.data.apiKey).toHaveProperty('keyHash');
  });
});
