import { z } from "zod";
import {
	arweaveTransactionIdSchema,
	paginationSchema,
	searchSchema,
	timestampRangeSchema,
	uuidSchema,
} from "./common.js";

// HNSW Configuration Schema (based on Eizen docs)
export const hnswConfigSchema = z.object({
	m: z.number().int().min(2).max(48).default(16), // connections per node
	efConstruction: z.number().int().min(10).max(800).default(200), // build quality
	efSearch: z.number().int().min(10).max(800).default(50), // search quality
});

// Vector embedding schema - supports high-dimensional vectors
export const vectorEmbeddingSchema = z
	.array(z.number().finite())
	.min(1)
	.max(4096) // Support up to 4096 dimensions
	.refine((arr) => arr.length > 0, {
		message: "Vector must contain at least one dimension",
	});

// Vector metadata schema - flexible but structured
export const vectorMetadataSchema = z.object({
	id: z.string().optional(),
	title: z.string().max(500).optional(),
	content: z.string().optional(),
	contentHash: z.string().optional(), // SHA-256 hash for deduplication
	category: z.string().max(100).optional(),
	tags: z.array(z.string().max(50)).max(20).optional(),
	source: z.string().max(200).optional(),
	author: z.string().max(100).optional(),
	importance: z.number().min(0).max(1).optional(), // 0-1 importance score
	timestamp: z.number().int().positive().optional(),
	// Embedding model information
	embeddingModel: z.string().max(100).optional(),
	embeddingDimensions: z.number().int().positive().optional(),
	// Custom user metadata
	custom: z.record(z.any()).optional(),
});

// Vector insertion request schema
export const insertVectorSchema = z.object({
	vector: vectorEmbeddingSchema,
	metadata: vectorMetadataSchema.optional(),
	// User context
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Batch vector insertion schema
export const batchInsertVectorSchema = z.object({
	vectors: z.array(insertVectorSchema).min(1).max(100), // Limit batch size to 100
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Vector search request schema
export const searchVectorSchema = z.object({
	query: vectorEmbeddingSchema,
	k: z.number().int().min(1).max(100).default(10), // number of results
	threshold: z.number().min(0).max(1).optional(), // minimum similarity threshold
	filters: z
		.object({
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			source: z.string().optional(),
			author: z.string().optional(),
			timeRange: timestampRangeSchema.optional(),
			importance: z
				.object({
					min: z.number().min(0).max(1).optional(),
					max: z.number().min(0).max(1).optional(),
				})
				.optional(),
			custom: z.record(z.any()).optional(),
		})
		.optional(),
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Text-based semantic search schema
export const semanticSearchSchema = z.object({
	query: z.string().min(1).max(1000),
	k: z.number().int().min(1).max(100).default(10),
	threshold: z.number().min(0).max(1).optional(),
	filters: z
		.object({
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			source: z.string().optional(),
			author: z.string().optional(),
			timeRange: timestampRangeSchema.optional(),
			importance: z
				.object({
					min: z.number().min(0).max(1).optional(),
					max: z.number().min(0).max(1).optional(),
				})
				.optional(),
		})
		.optional(),
	userId: uuidSchema.optional(),
});

// Vector search result schema
export const vectorSearchResultSchema = z.object({
	id: z.number().int().nonnegative(), // vector index in database
	distance: z.number().nonnegative(), // distance from query
	similarity: z.number().min(0).max(1), // similarity score (1 - distance)
	vector: vectorEmbeddingSchema.optional(), // include vector data if requested
	metadata: vectorMetadataSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Vector retrieval by ID schema
export const getVectorSchema = z.object({
	vectorId: z.number().int().nonnegative(),
	includeVector: z.boolean().default(false), // whether to include vector data
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Vector update schema
export const updateVectorSchema = z.object({
	vectorId: z.number().int().nonnegative(),
	metadata: vectorMetadataSchema.partial(), // allow partial updates
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Vector deletion schema
export const deleteVectorSchema = z.object({
	vectorId: z.number().int().nonnegative(),
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Contract deployment schema
export const deployContractSchema = z.object({
	userId: uuidSchema,
	hnswConfig: hnswConfigSchema.optional(),
	initialVectors: z.array(insertVectorSchema).max(10).optional(), // optional seed data
});

// Vector database statistics schema
export const vectorStatsSchema = z.object({
	userId: uuidSchema.optional(),
	contractTxId: arweaveTransactionIdSchema.optional(),
});

// Response schemas
export const vectorSearchResponseSchema = z.object({
	results: z.array(vectorSearchResultSchema),
	query: z.object({
		vector: vectorEmbeddingSchema.optional(),
		text: z.string().optional(),
		k: z.number(),
		threshold: z.number().optional(),
		filters: z.any().optional(),
	}),
	executionTime: z.number().nonnegative(), // search time in ms
	totalResults: z.number().int().nonnegative(),
});

export const vectorInsertResponseSchema = z.object({
	vectorId: z.number().int().nonnegative(),
	contractTxId: arweaveTransactionIdSchema,
	cost: z.number().nonnegative().optional(), // cost in AR tokens
	executionTime: z.number().nonnegative(), // insertion time in ms
});

export const batchInsertResponseSchema = z.object({
	vectorIds: z.array(z.number().int().nonnegative()),
	contractTxId: arweaveTransactionIdSchema,
	totalCost: z.number().nonnegative().optional(),
	executionTime: z.number().nonnegative(),
	successCount: z.number().int().nonnegative(),
	failureCount: z.number().int().nonnegative(),
	errors: z.array(z.string()).optional(),
});

export const vectorStatsResponseSchema = z.object({
	contractTxId: arweaveTransactionIdSchema,
	totalVectors: z.number().int().nonnegative(),
	totalDimensions: z.number().int().nonnegative().optional(),
	averageDimensions: z.number().nonnegative().optional(),
	indexSize: z.number().nonnegative().optional(), // estimated memory usage
	lastUpdated: z.string().datetime(),
	hnswConfig: hnswConfigSchema,
});

// Export type definitions
export type HnswConfig = z.infer<typeof hnswConfigSchema>;
export type VectorEmbedding = z.infer<typeof vectorEmbeddingSchema>;
export type VectorMetadata = z.infer<typeof vectorMetadataSchema>;
export type InsertVector = z.infer<typeof insertVectorSchema>;
export type BatchInsertVector = z.infer<typeof batchInsertVectorSchema>;
export type SearchVector = z.infer<typeof searchVectorSchema>;
export type SemanticSearch = z.infer<typeof semanticSearchSchema>;
export type VectorSearchResult = z.infer<typeof vectorSearchResultSchema>;
export type GetVector = z.infer<typeof getVectorSchema>;
export type UpdateVector = z.infer<typeof updateVectorSchema>;
export type DeleteVector = z.infer<typeof deleteVectorSchema>;
export type DeployContract = z.infer<typeof deployContractSchema>;
export type VectorStats = z.infer<typeof vectorStatsSchema>;
export type VectorSearchResponse = z.infer<typeof vectorSearchResponseSchema>;
export type VectorInsertResponse = z.infer<typeof vectorInsertResponseSchema>;
export type BatchInsertResponse = z.infer<typeof batchInsertResponseSchema>;
export type VectorStatsResponse = z.infer<typeof vectorStatsResponseSchema>;
