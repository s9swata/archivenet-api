import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios, { AxiosError } from 'axios'
import type { KeyObject } from 'crypto'

const expectErrorResponse = (error: unknown, status: number, message: string) => {
  if (axios.isAxiosError(error) && error.response) {
    expect(error.response.status).toBe(status)
    expect(error.response.data.error).toBe(message)
  } else {
    throw error
  }
}

describe('API Key Management Routes', () => {
  const baseURL = 'http://localhost:8080/apiKey'
  const testToken = 'test.jwt.token'
  let createdApiKeyId: string

  const headers = {
    Authorization: `Bearer ${testToken}`,
    'Content-Type': 'application/json'
  }

  describe('POST /apiKey/create', () => {
    const createEndpoint = `${baseURL}/create`

    it('should create a new API key with custom name and description', async () => {
      const requestBody = {
        name: 'Production API Key',
        description: 'API key for production environment access'
      }

      const response = await axios.post(createEndpoint, requestBody, { headers })
      expect(response.status).toBe(201)
      expect(response.data.message).toBe('API Key created successfully')
      expect(response.data.apiKey).toBeDefined()
      expect(response.data.apiKey.key).toMatch(/^ak_/)
      
      createdApiKeyId = response.data.apiKey.id
    })

    it('should create API key with default values when no options provided', async () => {
      const response = await axios.post(createEndpoint, {}, { headers })
      expect(response.status).toBe(201)
      expect(response.data.message).toBe('API Key created successfully')
      expect(response.data.apiKey.key).toMatch(/^ak_/)
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

  describe('GET /apiKey/list', () => {
    const listEndpoint = `${baseURL}/list`

    it('should return list of API keys', async () => {
      const response = await axios.get(listEndpoint, { headers })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.data.length).toBeGreaterThan(0)
      expect(response.data[0]).toHaveProperty('id')
      expect(response.data[0]).toHaveProperty('keyId')
      expect(response.data[0]).toHaveProperty('name')
    })

    it('should handle empty list gracefully', async () => {
      const currentKeys = await axios.get(listEndpoint, { headers })
      await Promise.all(
        //@ts-ignore
        currentKeys.data.map(key => 
          axios.delete(`${baseURL}/delete/${key.id}`, { headers })
        )
      )

      try {
        await axios.get(listEndpoint, { headers })
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 404, 'No API Keys found for this user')
      }
    })
  })

  describe('PUT /apiKey/update/:id', () => {
    it('should update API key name and description', async () => {
      const updates = {
        name: 'Updated Production API Key',
        description: 'Updated description'
      }

      const response = await axios.put(
        `${baseURL}/update/${createdApiKeyId}`, 
        updates, 
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data[0].name).toBe(updates.name)
      expect(response.data[0].description).toBe(updates.description)
    })

    it('should handle updating non-existent API key', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999'
      
      try {
        await axios.put(
          `${baseURL}/update/${nonExistentId}`, 
          { name: 'Test' }, 
          { headers }
        )
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 404, 'API Key not found or already deleted')
      }
    })
  })

  describe('DELETE /apiKey/delete/:id', () => {
    it('should delete an API key successfully', async () => {
      const response = await axios.delete(
        `${baseURL}/delete/${createdApiKeyId}`, 
        { headers }
      )
      expect(response.status).toBe(200)
      expect(response.data.message).toBe('API Key deleted successfully')
    })

    it('should handle deleting non-existent API key', async () => {
      try {
        await axios.delete(
          `${baseURL}/delete/nonexistent-id`, 
          { headers }
        )
        throw new Error('Should have thrown an error')
      } catch (error) {
        expectErrorResponse(error, 404, 'API Key not found or already deleted')
      }
    })
  })
})