import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios, { AxiosError } from 'axios'

const expectErrorResponse = (error: unknown, status: number, message: string) => {
  if (axios.isAxiosError(error) && error.response) {
    expect(error.response.status).toBe(status)
    expect(error.response.data.error).toBe(message)
  } else {
    throw error
  }
}

describe('User Subscription Management Routes', () => {
  const baseURL = 'http://localhost:3000/user_subscriptions'
  const testToken = 'test.jwt.token'
  const testUserId = 'user_2abc123def456'
  let createdSubscriptionId: string

  const headers = {
    Authorization: `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }

  describe('POST /user_subscriptions/create', () => {
    const createEndpoint = `${baseURL}/create`

    it('should create a new subscription with pro plan', async () => {
      const requestBody = {
        transactionId: 'txn_1a2b3c4d5e6f7890',
        subscriptionPlan: 'pro',
        quotaLimit: 5000
      }

      const response = await axios.post(createEndpoint, requestBody, { headers })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('User subscription update received')
      
      createdSubscriptionId = response.data.subscription.id
    })

    it('should create basic subscription with default quota', async () => {
      const requestBody = {
        transactionId: 'txn_basic_123456',
        subscriptionPlan: 'basic'
      }

      const response = await axios.post(createEndpoint, requestBody, { headers })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('User subscription update received')
    })

    it('should handle unauthorized requests', async () => {
      try {
        await axios.post(createEndpoint, {}, {
          headers: { 'Content-Type': 'application/json' }
        })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 401, 'Unauthorized - Invalid or missing token')
      }
    })
  })

  describe('GET /user_subscriptions/list/:userId', () => {
    const listEndpoint = `${baseURL}/list/${testUserId}`

    it('should return subscription details for user', async () => {
      const response = await axios.get(listEndpoint, { headers })
      expect(response.status).toBe(200)
      expect(response.data.data).toBeDefined()
      expect(response.data.data.clerkUserId).toBe(testUserId)
      expect(response.data.data.plan).toBeDefined()
      expect(response.data.data.quotaLimit).toBeGreaterThan(0)
    })

    it('should handle no subscription found', async () => {
      if (createdSubscriptionId) {
        await axios.delete(`${baseURL}/delete/${testUserId}`, { headers })
      }

      try {
        await axios.get(listEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 404, 'No subscription found for this user')
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

      try {
        const response = await axios.put(updateEndpoint, updates, { headers })
        expect(response.status).toBe(200)
        expect(response.data[0].plan).toBe(updates.plan)
        expect(response.data[0].quotaLimit).toBe(updates.quotaLimit)
      } catch (error) {
        throw new Error(`Failed to update subscription: ${error}`)
      }
    })

    it('should update quota usage', async () => {
      const updates = {
        quotaUsed: 1500
      }

      try {
        const response = await axios.put(updateEndpoint, updates, { headers })
        expect(response.status).toBe(200)
        expect(response.data[0].quotaUsed).toBe(updates.quotaUsed)
      } catch (error) {
        throw new Error(`Failed to update quota usage: ${error}`)
      }
    })

    it('should handle updating non-existent subscription', async () => {
      const nonExistentUserId = 'user_nonexistent123'
      
      try {
        await axios.put(`${baseURL}/update/${nonExistentUserId}`, {}, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 404, 'No subscription found for this user')
      }
    })
  })

  describe('DELETE /user_subscriptions/delete/:userId', () => {
    const deleteEndpoint = `${baseURL}/delete/${testUserId}`

    it('should delete subscription successfully', async () => {
      try {
        const response = await axios.delete(deleteEndpoint, { headers })
        expect(response.status).toBe(200)
        expect(response.data.message).toBe('User subscription deleted successfully')
      } catch (error) {
        throw new Error(`Failed to delete subscription: ${error}`)
      }
    })

    it('should handle deleting non-existent subscription', async () => {
      try {
        await axios.delete(deleteEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 404, 'No subscription found for this user')
      }
    })
  })
})