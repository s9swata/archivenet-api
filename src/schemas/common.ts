import { z } from "zod";

// Basic field validations for ArchiveNET system
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const arweaveTransactionIdSchema = z.string().length(43); // Arweave TX IDs are exactly 43 chars

// Vector schemas - directly match Eizen's API expectations
export const vectorEmbeddingSchema = z
	.array(z.number())
	.min(1)
	.max(4096) // Support up to 4096 dimensions (common for modern embeddings)
	.describe(
		"Vector embedding array - matches Eizen insert(point, metadata) 'point' parameter",
	);

export const vectorMetadataSchema = z
	.record(z.any())
	.optional()
	.describe(
		"Optional metadata object - matches Eizen insert(point, metadata) 'metadata' parameter",
	);

// Vector operations - exactly match Eizen API methods
export const insertVectorSchema = z
	.object({
		vector: vectorEmbeddingSchema,
		metadata: vectorMetadataSchema,
	})
	.describe("Schema for Eizen.insert(vector, metadata) method");

export const searchVectorSchema = z
	.object({
		query: vectorEmbeddingSchema,
		k: z.number().int().min(1).max(100).default(10),
	})
	.describe("Schema for Eizen.knn_search(query, k) method");

// Export types
export type UUID = z.infer<typeof uuidSchema>;
export type Email = z.infer<typeof emailSchema>;
export type ArweaveTransactionId = z.infer<typeof arweaveTransactionIdSchema>;
export type VectorEmbedding = z.infer<typeof vectorEmbeddingSchema>;
export type VectorMetadata = z.infer<typeof vectorMetadataSchema>;
export type InsertVector = z.infer<typeof insertVectorSchema>;
export type SearchVector = z.infer<typeof searchVectorSchema>;
