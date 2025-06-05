import { z } from 'zod';
import { apiKeySchema } from './apiKey.js';

export const userSchema = z.object({
    id: z.string().uuid(),
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    apiKeys: z.array(apiKeySchema).optional(), // Optional array of API keys associated with the user
})
export type User = z.infer<typeof userSchema>;