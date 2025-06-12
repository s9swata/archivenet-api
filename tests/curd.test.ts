import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import crypto from 'crypto';

const API_URL = 'http://localhost:8080';

describe('User CRUD Operations', () => {
  let testUser: {
    clerkId: string;
    email: string;
    username?: string;
    fullName?: string;
    metaMaskWalletAddress?: string;
  };

  beforeEach(() => {
    testUser = {
      clerkId: `user_${crypto.randomBytes(12).toString('hex')}`,
      email: 'test@example.com',
      username: 'testuser',
      fullName: 'Test User',
      metaMaskWalletAddress: '0x' + crypto.randomBytes(20).toString('hex')
    };
  });

  it('should create a new user', async () => {
    const res = await axios.post(`${API_URL}/user/create`, testUser);

    expect(res.status).toBe(201);
    expect(res.data.clerkId).toBe(testUser.clerkId);
    expect(res.data.email).toBe(testUser.email);
    expect(res.data.username).toBe(testUser.username);
  });

  it('should create user with minimal data', async () => {
    const minimalUser = {
      clerkId: `user_${crypto.randomBytes(12).toString('hex')}`,
      email: 'minimal@example.com'
    };

    const res = await axios.post(`${API_URL}/user/create`, minimalUser);
    expect(res.status).toBe(201);
    expect(res.data.email).toBe(minimalUser.email);
  });

  it('should get user information', async () => {
    // Create test user first
    const created = await axios.post(`${API_URL}/user/create`, testUser);

    // Get user info
    const res = await axios.post(`${API_URL}/user/info`, {
      userId: created.data.clerkId
    });

    expect(res.status).toBe(200);
    expect(res.data.email).toBe(testUser.email);
    expect(res.data.username).toBe(testUser.username);
  });

  it('should update user information', async () => {
    // Create test user first
    const created = await axios.post(`${API_URL}/user/create`, testUser);

    const updates = {
      userId: created.data.clerkId,
      updates: {
        fullName: 'Updated User Name',
        metaMaskWalletAddress: '0x' + crypto.randomBytes(20).toString('hex')
      }
    };

    const res = await axios.put(`${API_URL}/user/update`, updates);

    expect(res.status).toBe(200);
    expect(res.data.fullName).toBe(updates.updates.fullName);
    expect(res.data.metaMaskWalletAddress).toBe(updates.updates.metaMaskWalletAddress);
  });

  it('should delete user', async () => {
    // Create test user first
    const created = await axios.post(`${API_URL}/user/create`, testUser);

    // Delete user
    const deleteRes = await axios.delete(`${API_URL}/user/delete`, {
      data: { userId: created.data.clerkId }
    });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.data.message).toBe('User deleted successfully');

    // Verify deletion
    try {
      await axios.post(`${API_URL}/user/info`, {
        userId: created.data.clerkId
      });
      throw new Error('User should not exist');
    } catch (err: any) {
      expect(err.response.status).toBe(404);
      expect(err.response.data.error).toBe('User not found');
    }
  });

  it('should handle non-existent user', async () => {
    const nonExistentId = `user_${crypto.randomBytes(12).toString('hex')}`;
    
    try {
      await axios.post(`${API_URL}/user/info`, {
        userId: nonExistentId
      });
      throw new Error('Should not find non-existent user');
    } catch (err: any) {
      expect(err.response.status).toBe(404);
      expect(err.response.data.error).toBe('User not found');
    }
  });

  afterEach(async () => {
    try {
      // Clean up test user if it exists
      if (testUser.clerkId) {
        await axios.delete(`${API_URL}/user/delete`, {
          data: { userId: testUser.clerkId }
        });
      }
    } catch (err) {
      // Ignore errors during cleanup
    }
  });
});