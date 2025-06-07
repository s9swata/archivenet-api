# User Routes Usage Examples

## Base URL

```
Local Development: http://localhost:3000/user
Production: https://api.archivenet.com/user
```

---

## User Management Routes

### Create User

**Endpoint:** `POST /user/create`

**Description:** Creates a new user in the system.

**Request Body:**
- `clerkId` (required): Unique Clerk user identifier
- `email` (required): User's email address
- `username` (optional): Username (defaults to email if not provided)
- `fullName` (optional): User's full name (defaults to username if not provided)
- `metaMaskWalletAddress` (optional): MetaMask wallet address

**Usage Example:**

```bash
curl -X POST http://localhost:3000/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_2abc123def456",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "metaMaskWalletAddress": "0x742d35Cc6834C0532925a3b8D0e05e81F3f6a7A0"
  }'
```

**With Minimal Data:**

```bash
curl -X POST http://localhost:3000/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "clerkId": "user_2xyz789abc123",
    "email": "jane.smith@example.com"
  }'
```

**Success Response (201):**
```json
{
  "id": 1,
  "clerkId": "user_2abc123def456",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "fullName": "John Doe",
  "metaMaskWalletAddress": "0x742d35Cc6834C0532925a3b8D0e05e81F3f6a7A0",
  "status": "active",
  "createdAt": "2024-06-07T10:30:00.000Z",
  "updatedAt": "2024-06-07T10:30:00.000Z",
  "lastLoginAt": "2024-06-07T10:30:00.000Z"
}
```

**Error Response - User Already Exists (400):**
```json
{
  "error": "User already exists"
}
```

### Get User Information

**Endpoint:** `POST /user/info`

**Description:** Retrieves user information by Clerk ID.

**Request Body:**
- `userId` (required): Clerk user ID

**Usage Example:**

```bash
curl -X POST http://localhost:3000/user/info \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def456"
  }'
```

**Success Response (200):**
```json
{
  "id": 1,
  "clerkId": "user_2abc123def456",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "fullName": "John Doe",
  "metaMaskWalletAddress": "0x742d35Cc6834C0532925a3b8D0e05e81F3f6a7A0",
  "status": "active",
  "createdAt": "2024-06-07T10:30:00.000Z",
  "updatedAt": "2024-06-07T10:30:00.000Z",
  "lastLoginAt": "2024-06-07T10:30:00.000Z"
}
```

**Error Response - User Not Found (404):**
```json
{
  "error": "User not found"
}
```

### Update User

**Endpoint:** `PUT /user/update`

**Description:** Updates user information.

**Request Body:**
- `userId` (required): Clerk user ID
- `updates` (required): Object containing fields to update

**Usage Example:**

```bash
curl -X PUT http://localhost:3000/user/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def456",
    "updates": {
      "fullName": "John David Doe",
      "metaMaskWalletAddress": "0x123d35Cc6834C0532925a3b8D0e05e81F3f6a456"
    }
  }'
```

**Update Email:**

```bash
curl -X PUT http://localhost:3000/user/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def456",
    "updates": {
      "email": "john.doe.updated@example.com"
    }
  }'
```

**Update Status:**

```bash
curl -X PUT http://localhost:3000/user/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def456",
    "updates": {
      "status": "suspended"
    }
  }'
```

**Success Response (200):**
```json
{
  "id": 1,
  "clerkId": "user_2abc123def456",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "fullName": "John David Doe",
  "metaMaskWalletAddress": "0x123d35Cc6834C0532925a3b8D0e05e81F3f6a456",
  "status": "active",
  "createdAt": "2024-06-07T10:30:00.000Z",
  "updatedAt": "2024-06-07T11:45:00.000Z",
  "lastLoginAt": "2024-06-07T10:30:00.000Z"
}
```

**Error Response - User Not Found (404):**
```json
{
  "error": "User not found"
}
```

### Delete User

**Endpoint:** `DELETE /user/delete`

**Description:** Permanently deletes a user from the system.

**Request Body:**
- `userId` (required): Clerk user ID

**Usage Example:**

```bash
curl -X DELETE http://localhost:3000/user/delete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def456"
  }'
```

**Success Response (200):**
```json
{
  "message": "User deleted successfully",
  "user": {
    "id": 1,
    "clerkId": "user_2abc123def456",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "fullName": "John Doe",
    "metaMaskWalletAddress": "0x742d35Cc6834C0532925a3b8D0e05e81F3f6a7A0",
    "status": "active",
    "createdAt": "2024-06-07T10:30:00.000Z",
    "updatedAt": "2024-06-07T10:30:00.000Z",
    "lastLoginAt": "2024-06-07T10:30:00.000Z"
  }
}
```

**Error Response - User Not Found (404):**
```json
{
  "error": "User not found"
}
```

---


This comprehensive documentation covers all aspects of using your user routes with practical examples and best practices.

# API Key Routes Usage Examples

## Base URL

```
Local Development: http://localhost:3000/apiKey
Production: https://api.archivenet.com/apiKey
```

## Authentication

All API key routes require authentication with a valid Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## API Key Management Routes

### Create API Key

**Endpoint:** `POST /apiKey/create`

**Description:** Creates a new API key for the authenticated user.

**Authentication:** Required

**Request Body:**
- `name` (optional): Display name for the API key (defaults to "Default API Key")
- `description` (optional): Description of the API key (defaults to "API Key for ArchiveNet")

**Usage Example:**

```bash
curl -X POST http://localhost:3000/apiKey/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API Key",
    "description": "API key for production environment access"
  }'
```

**With Default Values:**

```bash
curl -X POST http://localhost:3000/apiKey/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Success Response (201):**
```json
{
  "message": "API Key created successfully",
  "apiKey": {
    "key": "ak_1a2b3c4d.e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
    "keyPrefix": "ak_1a2b3..."
  }
}
```

**Error Responses:**

**Failed to Generate (500):**
```json
{
  "error": "Failed to generate API Key"
}
```

**Database Error (500):**
```json
{
  "error": "Failed to create API Key in database"
}
```

**Unauthorized (401):**
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

---

### List API Keys

**Endpoint:** `GET /apiKey/list`

**Description:** Retrieves all API keys for the authenticated user.

**Authentication:** Required

**Usage Example:**

```bash
curl -X GET http://localhost:3000/apiKey/list \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "keyId": "ak_1a2b3c4d5e6f7890",
    "userId": "user_123",
    "keyHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "name": "Production API Key",
    "description": "API key for production environment access",
    "contract_tx_id": "",
    "arweave_wallet_address": "",
    "isActive": true,
    "lastUsedAt": "2024-06-07T10:30:00.000Z",
    "createdAt": "2024-06-07T09:00:00.000Z",
    "updatedAt": "2024-06-07T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "keyId": "ak_9z8y7x6w5v4u3t2s",
    "userId": "user_123",
    "keyHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "name": "Development API Key",
    "description": "API key for development testing",
    "contract_tx_id": "",
    "arweave_wallet_address": "",
    "isActive": true,
    "lastUsedAt": null,
    "createdAt": "2024-06-06T14:00:00.000Z",
    "updatedAt": "2024-06-06T14:00:00.000Z"
  }
]
```

**Error Response - No Keys Found (404):**
```json
{
  "error": "No API Keys found for this user"
}
```

---

### Update API Key

**Endpoint:** `PUT /apiKey/update/:id`

**Description:** Updates an existing API key's metadata.

**Authentication:** Required

**URL Parameters:**
- `id` (required): API key ID to update

**Request Body:**
- `name` (optional): New name for the API key
- `description` (optional): New description for the API key
- `isActive` (optional): Active status of the API key

**Usage Example:**

```bash
curl -X PUT http://localhost:3000/apiKey/update/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Production API Key",
    "description": "Updated description for production environment"
  }'
```

**Deactivate API Key:**

```bash
curl -X PUT http://localhost:3000/apiKey/update/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Success Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "keyId": "ak_1a2b3c4d5e6f7890",
    "userId": "user_123",
    "keyHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "name": "Updated Production API Key",
    "description": "Updated description for production environment",
    "contract_tx_id": "",
    "arweave_wallet_address": "",
    "isActive": true,
    "lastUsedAt": "2024-06-07T10:30:00.000Z",
    "createdAt": "2024-06-07T09:00:00.000Z",
    "updatedAt": "2024-06-07T11:45:00.000Z"
  }
]
```

**Error Response - Not Found (404):**
```json
{
  "error": "API Key not found or already deleted"
}
```

---

### Delete API Key

**Endpoint:** `DELETE /apiKey/delete/:id`

**Description:** Permanently deletes an API key.

**Authentication:** Required

**URL Parameters:**
- `id` (required): API key ID to delete

**Usage Example:**

```bash
curl -X DELETE http://localhost:3000/apiKey/delete/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "message": "API Key deleted successfully"
}
```

**Error Response - Not Found (404):**
```json
{
  "error": "API Key not found or already deleted"
}
```

---

## Error Handling

### Common Error Responses

**Authentication Required (401):**
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

**API Key Not Found (404):**
```json
{
  "error": "API Key not found or already deleted"
}
```

**No API Keys Found (404):**
```json
{
  "error": "No API Keys found for this user"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

**Key Generation Failed (500):**
```json
{
  "error": "Failed to generate API Key"
}
```

### Best Practices

1. **Store API Keys Securely**: Never log or expose the full API key after creation
2. **Handle One-Time Display**: Show the full key only once during creation
3. **Implement Confirmation**: Always confirm before deleting API keys
4. **Monitor Usage**: Track `lastUsedAt` to identify unused keys
5. **Use Descriptive Names**: Help users identify keys with meaningful names
6. **Regular Cleanup**: Periodically review and remove unused keys

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **API Key Display**: The full API key is only returned during creation - store it securely
2. **Key Storage**: Only the hashed version is stored in the database
3. **Authentication Required**: All routes require valid JWT authentication
4. **User Isolation**: Users can only manage their own API keys
5. **Audit Trail**: Track creation, updates, and usage of API keys

---

## Testing with Postman

### Environment Variables
```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "your-jwt-token-here",
  "testKeyId": ""
}
```

### Test Collection Sequence
1. **Create API Key** → Save key ID from response
2. **List API Keys** → Verify key appears in list
3. **Update API Key** → Modify name/description
4. **List API Keys** → Verify changes
5. **Delete API Key** → Remove test key
6. **List API Keys** → Verify key is gone

This comprehensive documentation covers all aspects of using your API key management routes with practical examples, error handling, and security best practices.

---

# User Subscription Routes Usage Examples

## Base URL

```
Local Development: http://localhost:3000/user_subscriptions
Production: https://api.archivenet.com/user_subscriptions
```

## Authentication

All user subscription routes require authentication with a valid Bearer token:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## User Subscription Management Routes

### Create User Subscription

**Endpoint:** `POST /user_subscriptions/create`

**Description:** Creates a new subscription for the authenticated user.

**Authentication:** Required

**Request Body:**
- `transactionId` (required): Transaction ID from payment processor
- `subscriptionPlan` (required): Subscription plan type ("basic", "pro", or "enterprise")
- `quotaLimit` (optional): API quota limit (defaults to 1000)

**Usage Example:**

```bash
curl -X POST http://localhost:3000/user_subscriptions/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_1a2b3c4d5e6f7890",
    "subscriptionPlan": "pro",
    "quotaLimit": 5000
  }'
```

**Basic Plan Example:**

```bash
curl -X POST http://localhost:3000/user_subscriptions/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_basic_123456",
    "subscriptionPlan": "basic"
  }'
```

**Enterprise Plan Example:**

```bash
curl -X POST http://localhost:3000/user_subscriptions/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "txn_enterprise_789012",
    "subscriptionPlan": "enterprise",
    "quotaLimit": 50000
  }'
```

**Success Response (200):**
```json
{
  "message": "User subscription update received"
}
```

**Error Response - Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

### Get User Subscription

**Endpoint:** `GET /user_subscriptions/list/:userId`

**Description:** Retrieves subscription details for a specific user.

**Authentication:** Required

**URL Parameters:**
- `userId` (required): Clerk user ID

**Usage Example:**

```bash
curl -X GET http://localhost:3000/user_subscriptions/list/user_2abc123def456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "message": "List of user subscriptions"
}
```

**Error Response - No Subscription Found (404):**
```json
{
  "error": "No subscription found for this user"
}
```

**Error Response - Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

### Update User Subscription

**Endpoint:** `PUT /user_subscriptions/update/:userId`

**Description:** Updates an existing user subscription.

**Authentication:** Required

**URL Parameters:**
- `userId` (required): Clerk user ID

**Request Body:**
- `plan` (optional): New subscription plan ("basic", "pro", or "enterprise")
- `quotaLimit` (optional): New quota limit
- `quotaUsed` (optional): Update used quota
- `isActive` (optional): Active status of subscription
- `renewsAt` (optional): New renewal date

**Usage Example:**

```bash
curl -X PUT http://localhost:3000/user_subscriptions/update/user_2abc123def456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro",
    "quotaLimit": 10000
  }'
```

**Update Quota Usage:**

```bash
curl -X PUT http://localhost:3000/user_subscriptions/update/user_2abc123def456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "quotaUsed": 1500
  }'
```

**Deactivate Subscription:**

```bash
curl -X PUT http://localhost:3000/user_subscriptions/update/user_2abc123def456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

**Update Renewal Date:**

```bash
curl -X PUT http://localhost:3000/user_subscriptions/update/user_2abc123def456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "renewsAt": "2024-07-07T10:30:00.000Z"
  }'
```

**Success Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "clerkUserId": "user_2abc123def456",
    "plan": "pro",
    "quotaLimit": 10000,
    "quotaUsed": 1500,
    "isActive": true,
    "renewsAt": "2024-07-07T10:30:00.000Z",
    "createdAt": "2024-06-07T10:30:00.000Z",
    "updatedAt": "2024-06-07T11:45:00.000Z"
  }
]
```

**Error Response - No Subscription Found (404):**
```json
{
  "error": "No subscription found for this user"
}
```

**Error Response - Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

### Delete User Subscription

**Endpoint:** `DELETE /user_subscriptions/delete/:userId`

**Description:** Permanently deletes a user subscription.

**Authentication:** Required

**URL Parameters:**
- `userId` (required): Clerk user ID

**Usage Example:**

```bash
curl -X DELETE http://localhost:3000/user_subscriptions/delete/user_2abc123def456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "message": "User subscription deleted successfully"
}
```

**Error Response - Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Error Handling

### Common Error Responses

**Authentication Required (401):**
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

**No Subscription Found (404):**
```json
{
  "error": "No subscription found for this user"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Subscription Plans

### Available Plans

1. **Basic Plan**
   - Default quota: 1000 API calls
   - Suitable for small projects and testing

2. **Pro Plan**
   - Recommended quota: 5000-10000 API calls
   - For professional developers and medium-scale applications

3. **Enterprise Plan**
   - High quota: 50000+ API calls
   - For large-scale applications and enterprise usage

---

## Testing with Postman

### Environment Variables
```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "your-jwt-token-here",
  "testUserId": "user_2abc123def456"
}
```

### Test Collection Sequence
1. **Create Subscription** → Create with basic plan
2. **Get Subscription** → Verify subscription details
3. **Update Subscription** → Upgrade to pro plan
4. **Get Subscription** → Verify upgrade
5. **Update Quota Usage** → Simulate API usage
6. **Delete Subscription** → Remove test subscription

---

## Best Practices

1. **Transaction Tracking**: Always include transactionId when creating subscriptions
2. **Quota Monitoring**: Regularly update quotaUsed to track API consumption
3. **Plan Management**: Use appropriate quota limits for each subscription plan
4. **Renewal Management**: Monitor renewsAt dates for subscription renewals
5. **Error Handling**: Implement proper error handling for all subscription operations

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Authentication Required**: All routes require valid JWT authentication
2. **User Isolation**: Users can only manage their own subscriptions via authentication
3. **Transaction Verification**: Verify payment transactions before creating subscriptions
4. **Quota Enforcement**: Implement quota checking in your API endpoints
5. **Audit Trail**: Track subscription changes for billing and compliance

This comprehensive documentation covers all aspects of using your user subscription routes with practical examples, error handling, and best practices.