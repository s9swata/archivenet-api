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