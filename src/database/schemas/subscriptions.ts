import { z } from 'zod';

export const subscriptionSchema = z.object({
    id: z.string().uuid(),  
    name: z.string().min(1).max(100), // Name of the subscription plan
    description: z.string().min(1).max(500), // Description of the plan
    price_monthly: z.number().nonnegative(), // Price of the subscription plan
    max_memories: z.number().int().nonnegative(), // Maximum number of memories allowed
    max_api_calls_per_month: z.number().int().nonnegative(), // Maximum API calls allowed per month
    features: z.array(z.string()), // List of features included in the plan
    createdAt: z.coerce.date(), // Creation date of the subscription plan
    updatedAt: z.coerce.date().optional(), // Optional, for tracking updates
    isActive: z.boolean().default(true), // Whether the subscription plan is active
});

export type Subscription = z.infer<typeof subscriptionSchema>;