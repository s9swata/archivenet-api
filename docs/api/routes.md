# ArchiveNet API Routes Usage Examples

## Authentication

All protected routes require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
Local Development: http://localhost:3000
Production: https://api.archivenet.com
```

---

## User Routes

### User Registration Webhook

**Endpoint:** `POST /webhook/user/registered`

**Description:** Webhook endpoint for Clerk user registration events.

**Usage Example:**

```bash
curl -X POST http://localhost:3000/webhook/user/registered \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "id": "user_2abc123def456",
      "username": "johndoe",
      "email_addresses": [
        {
          "email_address": "john@example.com"
        }
      ],
      "first_name": "John",
      "last_name": "Doe"
    }
  }'
```

**Response:**
```
User registration received
```

### User Deletion Webhook

**Endpoint:** `POST /webhook/user/deleted`

**Description:** Webhook endpoint for Clerk user deletion events.

**Usage Example:**

```bash
curl -X POST http://localhost:3000/webhook/user/deleted \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "id": "user_2abc123def456"
    }
  }'
```

**Response:**
```
User deletion received
```

---

## API Key Routes

### Create API Key

**Endpoint:** `POST /api/keys/create`

**Description:** Creates a new API key for the authenticated user.

**Authentication:** Required

**Usage Example:**

```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "description": "API key for production environment"
  }'
```

**With Default Values:**

```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "message": "API Key created successfully",
  "apiKey": {
    "keyId": "ak_1a2b3c4d5e6f7890",
    "keyHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "keyPrefix": "ak_1a2b3...",
    "name": "Production API Key",
    "description": "API key for production environment",
    "isActive": true,
    "createdAt": "2024-06-07T10:30:00.000Z"
  }
}
```

### API Key Creation Webhook

**Endpoint:** `POST /webhook/user/apiKey/created`

**Description:** Webhook endpoint for API key creation events.

**Usage Example:**

```bash
curl -X POST http://localhost:3000/webhook/user/apiKey/created \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "userId": "user123",
      "keyId": "ak_1a2b3c4d5e6f7890"
    }
  }'
```

**Response:**
```
API key creation received
```

---

## Subscription Routes

### Web3 Payment Webhook

**Endpoint:** `POST /webhook/user/payments/web3`

**Description:** Webhook endpoint for Web3 payment processing.

**Usage Example:**

```bash
curl -X POST http://localhost:3000/webhook/user/payments/web3 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "transactionId": "0x1234567890abcdef",
      "userId": "user123",
      "subscriptionPlan": "pro",
      "amount": "0.1",
      "currency": "ETH"
    }
  }'
```

**Response:**
```
User subscription update received
```

---

## Health Check Routes

### Root Endpoint

**Endpoint:** `GET /`

**Description:** Basic API information endpoint.

**Usage Example:**

```bash
curl http://localhost:3000/
```

**Response:**
```
This is the Backend API for ArchiveNET
```

### Health Check

**Endpoint:** `GET /health`

**Description:** API health status endpoint.

**Usage Example:**

```bash
curl http://localhost:3000/health
```

**Response:**
```
API is up and running!
```

---

## Memory Routes (Future Implementation)

### Create Memory

**Endpoint:** `POST /api/memories`

**Description:** Store a new memory in the vector database.

**Authentication:** Required

**Usage Example:**

```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Meeting notes from team standup on June 7th, 2024",
    "summary": "Discussed project timeline and upcoming deadlines",
    "context": "Daily team standup meeting",
    "importance": 0.8,
    "category": "work",
    "tags": ["meeting", "standup", "team"],
    "source": "mcp",
    "aiAgent": "claude-3.5-sonnet"
  }'
```

### Search Memories

**Endpoint:** `POST /api/memories/search`

**Description:** Search for memories using semantic similarity.

**Authentication:** Required

**Usage Example:**

```bash
curl -X POST http://localhost:3000/api/memories/search \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "team meeting notes",
    "limit": 10,
    "filters": {
      "category": "work",
      "importance": {
        "min": 0.5
      },
      "dateRange": {
        "start": "2024-06-01T00:00:00.000Z",
        "end": "2024-06-07T23:59:59.999Z"
      }
    },
    "includeEmbeddings": false
  }'
```

### List Memories

**Endpoint:** `GET /api/memories`

**Description:** Get paginated list of user's memories.

**Authentication:** Required

**Usage Example:**

```bash
curl "http://localhost:3000/api/memories?page=1&limit=20&sortBy=createdAt&sortOrder=desc&category=work" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Vector Operations Routes (Future Implementation)

### Create Vector Index

**Endpoint:** `POST /api/vectors/index`

**Description:** Create a new HNSW vector index on Arweave.

**Authentication:** Required

**Usage Example:**

```bash
curl -X POST http://localhost:3000/api/vectors/index \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "dimensions": 1536,
      "m": 16,
      "efConstruction": 200,
      "efSearch": 50
    },
    "name": "Production Index",
    "description": "Main vector index for production memories"
  }'
```

---

## Analytics Routes (Future Implementation)

### Get Memory Analytics

**Endpoint:** `GET /api/analytics/memories`

**Description:** Get memory usage analytics.

**Authentication:** Required

**Usage Example:**

```bash
curl "http://localhost:3000/api/analytics/memories?period=month&startDate=2024-05-01&endDate=2024-06-01" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Usage Analytics

**Endpoint:** `GET /api/analytics/usage`

**Description:** Get API usage analytics.

**Authentication:** Required

**Usage Example:**

```bash
curl "http://localhost:3000/api/analytics/usage?period=week&metrics=api_calls,response_times" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Handling

All routes return consistent error responses:

### Validation Error (400)

```json
{
  "success": false,
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

### Authentication Error (401)

```json
{
  "success": false,
  "error": "Unauthorized - Invalid or missing token"
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "error": "Resource not found"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## JavaScript/TypeScript Examples

### Using Fetch API

```javascript
// Create API Key
const createApiKey = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/keys/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'My New API Key',
        description: 'Key for my application'
      })
    });

    const data = await response.json();
    
    if (data.message === 'API Key created successfully') {
      console.log('API Key:', data.apiKey);
      // Store the key securely - user won't see it again!
    }
  } catch (error) {
    console.error('Error creating API key:', error);
  }
};

// Search Memories (future)
const searchMemories = async (query) => {
  try {
    const response = await fetch('http://localhost:3000/api/memories/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 10,
        filters: {
          importance: { min: 0.5 }
        }
      })
    });

    const data = await response.json();
    return data.memories;
  } catch (error) {
    console.error('Error searching memories:', error);
    return [];
  }
};
```

### Using Axios

```javascript
import axios from 'axios';

// Setup axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json',
  }
});

// Create API Key
const createApiKey = async (name, description) => {
  try {
    const response = await api.post('/api/keys/create', {
      name,
      description
    });
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
createApiKey('Production Key', 'Key for production app')
  .then(result => {
    console.log('Created:', result.apiKey);
  })
  .catch(error => {
    console.error('Failed to create API key');
  });
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 10 requests per 15 minutes per IP
- **Search endpoints**: 50 requests per 15 minutes per user

When rate limited, you'll receive a 429 status code:

```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retryAfter": 900
}
```

---

## CORS Configuration

The API accepts requests from configured origins. For development:

```
Allowed Origins: http://localhost:3000
Credentials: Enabled
```

For production, configure the `ORIGIN` environment variable:

```bash
ORIGIN=https://app.archivenet.com,https://dashboard.archivenet.com
```