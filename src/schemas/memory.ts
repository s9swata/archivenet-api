import { z } from "zod";
import { arweaveTransactionIdSchema, uuidSchema } from "./common.js";

// Memory creation request - what API receives to create a new memory
export const createMemorySchema = z
	.object({
		content: z.string().min(1).max(10000), // Text content to convert to embeddings
		userId: uuidSchema, // User creating the memory
		contractTxId: arweaveTransactionIdSchema, // Target Arweave contract
	})
	.describe(
		"API request to create new memory - content will be converted to embeddings and send to Eizen",
	);

// Memory search request - for semantic search through user's memories
export const searchMemorySchema = z
	.object({
		query: z.string().min(1).max(1000), // Natural language search query
		k: z.number().int().min(1).max(100).default(10), // Number of similar memories to return
		userId: uuidSchema.optional(), // Optional user filter
	})
	.describe(
		"Semantic search request - query gets converted to embeddings for Eizen.knn_search()",
	);

export type CreateMemory = z.infer<typeof createMemorySchema>;
export type SearchMemory = z.infer<typeof searchMemorySchema>;
