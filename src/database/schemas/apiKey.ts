import { z } from 'zod';

export const apiKeySchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string().min(1).max(100), // Name of the API key
    key: z.string().min(32).max(64), // API key value
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(), // Optional, for tracking updates
    isRateLimited: z.boolean().default(false), // Whether the API key is rate-limited
    usageCount: z.number().int().nonnegative().default(0),
    lastUsedAt: z.coerce.date().optional(),
    isActive: z.boolean().default(true), //Whether api key is active or revoked
}).strict();

export type ApiKey = z.infer<typeof apiKeySchema>;