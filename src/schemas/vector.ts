import { z } from "zod";

// Vector embedding - just an array of numbers
export const vectorEmbeddingSchema = z.array(z.number()).min(1).max(4096); // Support up to 4096 dimensions

// Vector metadata - simple optional object (exactly like Eizen docs)
export const vectorMetadataSchema = z.record(z.any()).optional();

// Vector insertion schema - minimal, matches Eizen.insert(vector, metadata)
export const insertVectorSchema = z.object({
	vector: vectorEmbeddingSchema,
	metadata: vectorMetadataSchema,
});

// KNN search schema - matches Eizen.knn_search(query, k)
export const searchVectorSchema = z.object({
	query: vectorEmbeddingSchema,
	k: z.number().int().min(1).max(100).default(10),
});

// Export types
export type VectorEmbedding = z.infer<typeof vectorEmbeddingSchema>;
export type VectorMetadata = z.infer<typeof vectorMetadataSchema>;
export type InsertVector = z.infer<typeof insertVectorSchema>;
export type SearchVector = z.infer<typeof searchVectorSchema>;
