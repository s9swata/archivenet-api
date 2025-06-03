import { z } from "zod";
import {
	arweaveTransactionIdSchema,
	paginationSchema,
	searchSchema,
	timestampRangeSchema,
	uuidSchema,
} from "./common.js";
import { vectorEmbeddingSchema, vectorMetadataSchema } from "./vector.js";

// Memory entry core schema - represents a stored AI memory
export const memoryEntrySchema = z.object({
	id: uuidSchema.optional(),
	userId: uuidSchema,
	contractTxId: arweaveTransactionIdSchema,
	vectorIndex: z.number().int().nonnegative(), // index in the vector database

	// Content information
	content: z.string().min(1).max(10000), // original content text
	contentHash: z.string().length(64), // SHA-256 hash for deduplication
	summary: z.string().max(500).optional(), // AI-generated summary

	// Context and metadata
	context: z.string().max(2000).optional(), // conversation context
	importance: z.number().min(0).max(1).default(0.5), // importance score 0-1
	category: z.string().max(100).optional(), // user-defined category
	tags: z.array(z.string().max(50)).max(20).default([]), // searchable tags

	// Source information
	source: z
		.enum([
			"mcp", // Model Context Protocol
			"api", // Direct API call
			"web", // Web interface
			"import", // Bulk import
			"system", // System generated
		])
		.default("mcp"),
	sourceId: z.string().max(200).optional(), // external reference ID
	aiAgent: z.string().max(100).optional(), // which AI agent created this

	// Embedding information
	embeddingModel: z.string().max(100).default("text-embedding-ada-002"),
	embeddingDimensions: z.number().int().positive().default(1536),
	embeddingCost: z.number().nonnegative().optional(), // cost in USD

	// Storage information
	storageCost: z.number().nonnegative().optional(), // cost in AR tokens
	storageSize: z.number().int().nonnegative().optional(), // size in bytes

	// Timestamps
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
	accessedAt: z.string().datetime().optional(), // last accessed

	// Relationships
	parentMemoryId: uuidSchema.optional(), // for hierarchical memories
	childMemoryIds: z.array(uuidSchema).default([]),
	relatedMemoryIds: z.array(uuidSchema).default([]),

	// Access control
	isPrivate: z.boolean().default(true),
	sharedWith: z.array(uuidSchema).default([]), // shared user IDs

	// Lifecycle
	status: z
		.enum(["active", "archived", "deleted", "processing", "failed"])
		.default("active"),
	version: z.number().int().positive().default(1),
});

// Memory creation request schema
export const createMemorySchema = z.object({
	content: z.string().min(1).max(10000),
	context: z.string().max(2000).optional(),
	importance: z.number().min(0).max(1).default(0.5),
	category: z.string().max(100).optional(),
	tags: z.array(z.string().max(50)).max(20).default([]),
	source: z.enum(["mcp", "api", "web", "import", "system"]).default("api"),
	sourceId: z.string().max(200).optional(),
	aiAgent: z.string().max(100).optional(),
	embeddingModel: z.string().max(100).optional(),
	isPrivate: z.boolean().default(true),
	parentMemoryId: uuidSchema.optional(),
});

// Memory update schema - partial updates allowed
export const updateMemorySchema = z.object({
	memoryId: uuidSchema,
	content: z.string().min(1).max(10000).optional(),
	summary: z.string().max(500).optional(),
	context: z.string().max(2000).optional(),
	importance: z.number().min(0).max(1).optional(),
	category: z.string().max(100).optional(),
	tags: z.array(z.string().max(50)).max(20).optional(),
	isPrivate: z.boolean().optional(),
	status: z.enum(["active", "archived", "deleted"]).optional(),
});

// Memory search schema
export const searchMemoriesSchema = z.object({
	query: z.string().min(1).max(1000),
	k: z.number().int().min(1).max(100).default(10),
	threshold: z.number().min(0).max(1).default(0.3), // minimum similarity
	filters: z
		.object({
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			source: z.enum(["mcp", "api", "web", "import", "system"]).optional(),
			aiAgent: z.string().optional(),
			importance: z
				.object({
					min: z.number().min(0).max(1).optional(),
					max: z.number().min(0).max(1).optional(),
				})
				.optional(),
			timeRange: timestampRangeSchema.optional(),
			status: z.enum(["active", "archived"]).optional(),
			isPrivate: z.boolean().optional(),
			hasParent: z.boolean().optional(),
			hasChildren: z.boolean().optional(),
		})
		.optional(),
	includeVector: z.boolean().default(false),
	includeContent: z.boolean().default(true),
	userId: uuidSchema.optional(),
});

// Memory list/browse schema
export const listMemoriesSchema = z.object({
	...paginationSchema.shape,
	sortBy: z
		.enum(["createdAt", "updatedAt", "accessedAt", "importance", "category"])
		.default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	filters: z
		.object({
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			source: z.enum(["mcp", "api", "web", "import", "system"]).optional(),
			status: z.enum(["active", "archived", "deleted"]).optional(),
			timeRange: timestampRangeSchema.optional(),
			importance: z
				.object({
					min: z.number().min(0).max(1).optional(),
					max: z.number().min(0).max(1).optional(),
				})
				.optional(),
			isPrivate: z.boolean().optional(),
		})
		.optional(),
	includeContent: z.boolean().default(false), // summary only by default
	userId: uuidSchema.optional(),
});

// Get memory by ID schema
export const getMemorySchema = z.object({
	memoryId: uuidSchema,
	includeVector: z.boolean().default(false),
	includeRelated: z.boolean().default(false),
	markAsAccessed: z.boolean().default(true), // update accessedAt timestamp
	userId: uuidSchema.optional(),
});

// Delete memory schema
export const deleteMemorySchema = z.object({
	memoryId: uuidSchema,
	permanent: z.boolean().default(false), // soft delete vs permanent
	deleteRelated: z.boolean().default(false), // delete child memories
	userId: uuidSchema.optional(),
});

// Bulk operations schema
export const bulkMemoryOperationSchema = z.object({
	memoryIds: z.array(uuidSchema).min(1).max(100),
	operation: z.enum(["delete", "archive", "activate", "update"]),
	updateData: updateMemorySchema.omit({ memoryId: true }).optional(),
	userId: uuidSchema.optional(),
});

// Memory export schema
export const exportMemoriesSchema = z.object({
	filters: searchMemoriesSchema.shape.filters.optional(),
	format: z.enum(["json", "csv", "markdown"]).default("json"),
	includeVectors: z.boolean().default(false),
	includeMetadata: z.boolean().default(true),
	userId: uuidSchema.optional(),
});

// Memory import schema
export const importMemoriesSchema = z.object({
	memories: z.array(createMemorySchema).min(1).max(1000),
	overwriteExisting: z.boolean().default(false),
	validateContent: z.boolean().default(true),
	userId: uuidSchema.optional(),
});

// Memory analytics schema
export const memoryAnalyticsSchema = z.object({
	timeRange: timestampRangeSchema.optional(),
	groupBy: z.enum(["day", "week", "month"]).default("day"),
	metrics: z
		.array(
			z.enum([
				"count",
				"storage_size",
				"embedding_cost",
				"storage_cost",
				"category_distribution",
				"source_distribution",
				"importance_distribution",
			]),
		)
		.default(["count"]),
	userId: uuidSchema.optional(),
});

// Response schemas
export const memorySearchResultSchema = z.object({
	memory: memoryEntrySchema,
	similarity: z.number().min(0).max(1),
	vector: vectorEmbeddingSchema.optional(),
	relatedMemories: z
		.array(
			memoryEntrySchema.omit({
				content: true,
				context: true,
			}),
		)
		.optional(),
});

export const memorySearchResponseSchema = z.object({
	results: z.array(memorySearchResultSchema),
	query: z.string(),
	totalResults: z.number().int().nonnegative(),
	executionTime: z.number().nonnegative(),
	filters: z.any().optional(),
});

export const memoryListResponseSchema = z.object({
	memories: z.array(memoryEntrySchema),
	pagination: z.object({
		total: z.number(),
		page: z.number(),
		limit: z.number(),
		totalPages: z.number(),
		hasNext: z.boolean(),
		hasPrev: z.boolean(),
	}),
});

export const memoryAnalyticsResponseSchema = z.object({
	timeRange: timestampRangeSchema,
	metrics: z.record(z.any()),
	summary: z.object({
		totalMemories: z.number().int().nonnegative(),
		totalStorage: z.number().nonnegative(),
		totalCost: z.number().nonnegative(),
		averageImportance: z.number().min(0).max(1),
		mostUsedCategories: z.array(z.string()),
		mostUsedTags: z.array(z.string()),
	}),
});

export const bulkOperationResponseSchema = z.object({
	successCount: z.number().int().nonnegative(),
	failureCount: z.number().int().nonnegative(),
	errors: z.array(
		z.object({
			memoryId: uuidSchema,
			error: z.string(),
		}),
	),
	executionTime: z.number().nonnegative(),
});

// Export type definitions
export type MemoryEntry = z.infer<typeof memoryEntrySchema>;
export type CreateMemory = z.infer<typeof createMemorySchema>;
export type UpdateMemory = z.infer<typeof updateMemorySchema>;
export type SearchMemories = z.infer<typeof searchMemoriesSchema>;
export type ListMemories = z.infer<typeof listMemoriesSchema>;
export type GetMemory = z.infer<typeof getMemorySchema>;
export type DeleteMemory = z.infer<typeof deleteMemorySchema>;
export type BulkMemoryOperation = z.infer<typeof bulkMemoryOperationSchema>;
export type ExportMemories = z.infer<typeof exportMemoriesSchema>;
export type ImportMemories = z.infer<typeof importMemoriesSchema>;
export type MemoryAnalytics = z.infer<typeof memoryAnalyticsSchema>;
export type MemorySearchResult = z.infer<typeof memorySearchResultSchema>;
export type MemorySearchResponse = z.infer<typeof memorySearchResponseSchema>;
export type MemoryListResponse = z.infer<typeof memoryListResponseSchema>;
export type MemoryAnalyticsResponse = z.infer<
	typeof memoryAnalyticsResponseSchema
>;
export type BulkOperationResponse = z.infer<typeof bulkOperationResponseSchema>;
