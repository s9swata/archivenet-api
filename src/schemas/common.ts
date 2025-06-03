import { z } from "zod";

// Common utility schemas

/**  When users browse their memory collections, search results, or usage statistics
Page-based pagination with configurable limits (1-100 items per page) ---> Dashboard*/
export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	offset: z.coerce.number().int().min(0).optional(),
});

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const sortSchema = z.object({
	sortBy: z.string().optional(),
	sortOrder: sortOrderSchema,
});

export const timestampRangeSchema = z.object({
	startDate: z.coerce.date().optional(),
	endDate: z.coerce.date().optional(),
});

export const searchSchema = z.object({
	query: z.string().min(1).max(1000),
	filters: z.record(z.any()).optional(),
});

// Common field validations
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
export const arweaveTransactionIdSchema = z.string().length(43);

// Common response schemas
export const successResponseSchema = z.object({
	success: z.literal(true),
	message: z.string(),
	data: z.any().optional(),
});

export const errorResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
	code: z.string().optional(),
	details: z.any().optional(),
});

export const paginatedResponseSchema = z.object({
	data: z.array(z.any()),
	pagination: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
		totalPages: z.number(),
		hasNext: z.boolean(),
		hasPrev: z.boolean(),
	}),
});

// Health check schema
export const healthCheckSchema = z.object({
	status: z.enum(["healthy", "unhealthy"]),
	timestamp: z.string().datetime(),
	version: z.string().optional(),
	services: z
		.object({
			database: z.enum(["connected", "disconnected"]),
			redis: z.enum(["connected", "disconnected"]),
			arweave: z.enum(["connected", "disconnected"]),
		})
		.optional(),
});

// API Key/Token scopes
export const apiScopesSchema = z.array(
	z.enum([
		"memory:read",
		"memory:write",
		"memory:delete",
		"profile:read",
		"profile:write",
		"usage:read",
		"tokens:manage",
	]),
);

// Rate limiting schemas
export const rateLimitSchema = z.object({
	requests: z.number().int().min(1),
	windowMs: z.number().int().min(1000),
});

// Export type definitions for TypeScript
export type Pagination = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type TimestampRange = z.infer<typeof timestampRangeSchema>;
export type Search = z.infer<typeof searchSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type ApiScopes = z.infer<typeof apiScopesSchema>;
export type RateLimit = z.infer<typeof rateLimitSchema>;
