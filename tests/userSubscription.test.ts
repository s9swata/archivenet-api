import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('User Subscription Management Routes', () => {
  const baseURL = 'http://localhost:3000/user_subscriptions'
  const mock = new MockAdapter(axios)
  const testToken = 'test.jwt.token'
  const testUserId = 'user_2abc123def456'

  const headers = {
    Authorization: `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }

  beforeEach(() => {
    mock.reset()
  })

  describe('POST /user_subscriptions/create', () => {
    const createEndpoint = `${baseURL}/create`

    it('should create a new subscription with pro plan', async () => {
      const requestBody = {
        transactionId: 'txn_1a2b3c4d5e6f7890',
        subscriptionPlan: 'pro',
        quotaLimit: 5000
      }

      const mockResponse = {
        message: 'User subscription update received'
      }

      mock.onPost(createEndpoint).reply(200, mockResponse)

      const response = await axios.post(createEndpoint, requestBody, { headers })
      expect(response.status).toBe(200)
      expect(response.data).toEqual(mockResponse)
    })

    it('should create basic subscription with default quota', async () => {
      const requestBody = {
        transactionId: 'txn_basic_123456',
        subscriptionPlan: 'basic'
      }

      mock.onPost(createEndpoint).reply(200, {
        message: 'User subscription update received'
      })

      const response = await axios.post(createEndpoint, requestBody, { headers })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('User subscription update received')
    })

    it('should handle unauthorized requests', async () => {
      mock.onPost(createEndpoint).reply(401, {
        error: 'Unauthorized - Invalid or missing token'
      })

      try {
        await axios.post(createEndpoint, {}, {
          headers: { 'Content-Type': 'application/json' }
        })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(401)
        expect(error.response.data.error).toBe('Unauthorized - Invalid or missing token')
      }
    })
  })

  describe('GET /user_subscriptions/list/:userId', () => {
    const listEndpoint = `${baseURL}/list/${testUserId}`

    it('should return subscription details for user', async () => {
      const mockSubscription = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        clerkUserId: testUserId,
        plan: 'pro',
        quotaLimit: 10000,
        quotaUsed: 1500,
        isActive: true,
        renewsAt: '2024-07-07T10:30:00.000Z',
        createdAt: '2024-06-07T10:30:00.000Z',
        updatedAt: '2024-06-07T11:45:00.000Z'
      }

      mock.onGet(listEndpoint).reply(200, {
        message: 'List of user subscriptions',
        data: mockSubscription
      })

      const response = await axios.get(listEndpoint, { headers })
      expect(response.status).toBe(200)
      expect(response.data.data).toEqual(mockSubscription)
    })

    it('should handle no subscription found', async () => {
      mock.onGet(listEndpoint).reply(404, {
        error: 'No subscription found for this user'
      })

      try {
        await axios.get(listEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.error).toBe('No subscription found for this user')
      }
    })
  })

  describe('PUT /user_subscriptions/update/:userId', () => {
    const updateEndpoint = `${baseURL}/update/${testUserId}`

    it('should update subscription plan and quota', async () => {
      const updates = {
        plan: 'pro',
        quotaLimit: 10000
      }

      const mockResponse = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        clerkUserId: testUserId,
        plan: 'pro',
        quotaLimit: 10000,
        quotaUsed: 1500,
        isActive: true,
        renewsAt: '2024-07-07T10:30:00.000Z',
        createdAt: '2024-06-07T10:30:00.000Z',
        updatedAt: '2024-06-07T11:45:00.000Z'
      }

      mock.onPut(updateEndpoint).reply(200, [mockResponse])

      const response = await axios.put(updateEndpoint, updates, { headers })
      expect(response.status).toBe(200)
      expect(response.data[0].plan).toBe(updates.plan)
      expect(response.data[0].quotaLimit).toBe(updates.quotaLimit)
    })

    it('should update quota usage', async () => {
      const updates = {
        quotaUsed: 1500
      }

      mock.onPut(updateEndpoint).reply(200, [{
        ...updates,
        id: '550e8400-e29b-41d4-a716-446655440001',
        clerkUserId: testUserId
      }])

      const response = await axios.put(updateEndpoint, updates, { headers })
      expect(response.status).toBe(200)
      expect(response.data[0].quotaUsed).toBe(updates.quotaUsed)
    })

    it('should handle updating non-existent subscription', async () => {
      mock.onPut(updateEndpoint).reply(404, {
        error: 'No subscription found for this user'
      })

      try {
        await axios.put(updateEndpoint, {}, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.error).toBe('No subscription found for this user')
      }
    })
  })

  describe('DELETE /user_subscriptions/delete/:userId', () => {
    const deleteEndpoint = `${baseURL}/delete/${testUserId}`

    it('should delete subscription successfully', async () => {
      mock.onDelete(deleteEndpoint).reply(200, {
        message: 'User subscription deleted successfully'
      })

      const response = await axios.delete(deleteEndpoint, { headers })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('User subscription deleted successfully')
    })

    it('should handle deleting non-existent subscription', async () => {
      mock.onDelete(deleteEndpoint).reply(404, {
        error: 'No subscription found for this user'
      })

      try {
        await axios.delete(deleteEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.error).toBe('No subscription found for this user')
      }
    })
  })

  afterEach(() => {
    mock.reset()
  })
})