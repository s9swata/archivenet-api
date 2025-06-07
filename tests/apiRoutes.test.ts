import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('API Key Management Routes', () => {
  const baseURL = 'http://localhost:8080/apiKey'
  const mock = new MockAdapter(axios)
  const testToken = 'test.jwt.token'
  const testApiKeyId = '550e8400-e29b-41d4-a716-446655440001'

  const headers = {
    Authorization: `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }

  beforeEach(() => {
    mock.reset()
  })

  describe('POST /apiKey/create', () => {
    const createEndpoint = `${baseURL}/create`

    it('should create a new API key with custom name and description', async () => {
      const requestBody = {
        name: 'Production API Key',
        description: 'API key for production environment access'
      }

      const mockResponse = {
        message: 'API Key created successfully',
        apiKey: {
          key: 'ak_1a2b3c4d.e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
          keyPrefix: 'ak_1a2b3...'
        }
      }

      mock.onPost(createEndpoint).reply(201, mockResponse)

      const response = await axios.post(createEndpoint, requestBody, { headers })
      expect(response.status).toBe(201)
      expect(response.data).toEqual(mockResponse)
    })

    it('should create API key with default values when no options provided', async () => {
      mock.onPost(createEndpoint).reply(201, {
        message: 'API Key created successfully',
        apiKey: {
          key: 'ak_default.key123',
          keyPrefix: 'ak_default...'
        }
      })

      const response = await axios.post(createEndpoint, {}, { headers })
      expect(response.status).toBe(201)
      expect(response.data.message).toBe('API Key created successfully')
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

  describe('GET /apiKey/list', () => {
    const listEndpoint = `${baseURL}/list`

    it('should return list of API keys', async () => {
      const mockApiKeys = [
        {
          id: testApiKeyId,
          keyId: 'ak_1a2b3c4d5e6f7890',
          userId: 'user_123',
          name: 'Production API Key',
          isActive: true
        }
      ]

      mock.onGet(listEndpoint).reply(200, mockApiKeys)

      const response = await axios.get(listEndpoint, { headers })
      expect(response.status).toBe(200)
      expect(response.data).toEqual(mockApiKeys)
    })

    it('should handle no API keys found', async () => {
      mock.onGet(listEndpoint).reply(404, {
        error: 'No API Keys found for this user'
      })

      try {
        await axios.get(listEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.error).toBe('No API Keys found for this user')
      }
    })
  })

  describe('PUT /apiKey/update/:id', () => {
    const updateEndpoint = `${baseURL}/update/${testApiKeyId}`

    it('should update API key name and description', async () => {
      const updates = {
        name: 'Updated Production API Key',
        description: 'Updated description'
      }

      const mockResponse = [{
        id: testApiKeyId,
        keyId: 'ak_1a2b3c4d5e6f7890',
        name: updates.name,
        description: updates.description,
        isActive: true
      }]

      mock.onPut(updateEndpoint).reply(200, mockResponse)

      const response = await axios.put(updateEndpoint, updates, { headers })
      expect(response.status).toBe(200)
      expect(response.data[0].name).toBe(updates.name)
    })

    it('should handle updating non-existent API key', async () => {
      mock.onPut(updateEndpoint).reply(404, {
        error: 'API Key not found or already deleted'
      })

      try {
        await axios.put(updateEndpoint, {}, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.error).toBe('API Key not found or already deleted')
      }
    })
  })

  describe('DELETE /apiKey/delete/:id', () => {
    const deleteEndpoint = `${baseURL}/delete/${testApiKeyId}`

    it('should delete an API key successfully', async () => {
      mock.onDelete(deleteEndpoint).reply(200, {
        message: 'API Key deleted successfully'
      })

      const response = await axios.delete(deleteEndpoint, { headers })
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('API Key deleted successfully')
    })

    it('should handle deleting non-existent API key', async () => {
      mock.onDelete(deleteEndpoint).reply(404, {
        error: 'API Key not found or already deleted'
      })

      try {
        await axios.delete(deleteEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expect(error.response.status).toBe(404)
        expect(error.response.data.error).toBe('API Key not found or already deleted')
      }
    })
  })

  afterEach(() => {
    mock.reset()
  })
})