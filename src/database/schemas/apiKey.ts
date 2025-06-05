import { z } from 'zod';
import { apiScopesSchema } from './common.js';

export const apiKeySchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100), // Name of the API key
    token_hash: z.string().min(64).max(64), // Hashed token for security
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(), // Optional, for tracking updates
    isRateLimited: z.boolean().default(false), // Whether the API key is rate-limited
    usageCount: z.number().int().nonnegative().default(0),
    lastUsedAt: z.coerce.date().optional(),
    isActive: z.boolean().default(true), //Whether api key is active or revoked
    expiresAt: z.coerce.date().optional(), // Optional expiration date for the API key
    revokedAt: z.coerce.date().optional(), // Optional date when the API key was revoked
    scopes: apiScopesSchema, // Scopes associated with the API key
}).strict();

export type ApiKey = z.infer<typeof apiKeySchema>;