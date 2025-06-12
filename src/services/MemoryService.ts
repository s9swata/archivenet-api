import type { SearchFilters } from "../schemas/common.js";
import type { VectorMetadata } from "../schemas/eizen.js";
import type { CreateMemory, SearchMemory } from "../schemas/memory.js";
import { eizenService } from "./EizenService.js";
import { embeddingService } from "./EmbeddingService.js";

export interface MemoryResult {
	id: number;
	content?: string;
	metadata?: VectorMetadata;
	distance?: number;
}

export interface CreateMemoryResult {
	success: boolean;
	memoryId: number;
	message: string;
}

export interface MemoryStats {
	totalMemories: number;
	embeddingService: "xenova" | "unavailable";
	isInitialized: boolean;
}

/**
 * Service class for handling memory operations
 * Bridges between text content and vector storage via Eizen
 */
export class MemoryService {
	/**
	 * Create a new memory from text content
	 * Converts text to embeddings and stores in Eizen
	 */
	async createMemory(data: CreateMemory): Promise<CreateMemoryResult> {
		try {
			console.log(
				`Creating memory from content: "${data.content.substring(0, 50)}..."`,
			);

			// Convert text content to vector embeddings
			const embeddings = await this.textToEmbeddings(data.content);

			// Enhance metadata with content reference and timestamp
			const enhancedMetadata: VectorMetadata = {
				...data.metadata,
				content: data.content,
				createdAt: new Date().toISOString(),
				contentLength: data.content.length,
				source: "archivenet-api",
			};

			// Store vector in Eizen
			const result = await eizenService.insertVector({
				vector: embeddings,
				metadata: enhancedMetadata,
			});

			console.log(`Memory created successfully with ID: ${result.vectorId}`);

			return {
				success: true,
				memoryId: result.vectorId,
				message: `Memory created from ${data.content.length} characters of content`,
			};
		} catch (error) {
			console.error("Failed to create memory:", error);
			throw new Error(
				`Failed to create memory: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Search memories using natural language query
	 * Converts query text to embeddings and searches Eizen
	 */
	async searchMemories(data: SearchMemory): Promise<MemoryResult[]> {
		try {
			console.log(`🔍 Searching memories with query: "${data.query}"`);

			// Convert search query to vector embeddings
			const queryEmbeddings = await this.textToEmbeddings(data.query);

			// Search for similar vectors in Eizen
			const searchResults = await eizenService.searchVectors({
				query: queryEmbeddings,
				k: data.k,
			});

			// Transform results to memory format
			const memories: MemoryResult[] = searchResults.map((result) => ({
				id: result.id,
				content: (result.metadata?.content as string) || undefined,
				metadata: result.metadata,
				distance: result.distance,
			}));

			// Apply filters if provided
			const filteredMemories = this.applyFilters(memories, data.filters);

			console.log(`Found ${filteredMemories.length} relevant memories`);

			return filteredMemories;
		} catch (error) {
			console.error("Failed to search memories:", error);
			throw new Error(
				`Failed to search memories: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get a specific memory by its ID
	 */
	async getMemory(memoryId: number): Promise<MemoryResult | null> {
		try {
			console.log(`Retrieving memory with ID: ${memoryId}`);

			const vector = await eizenService.getVector(memoryId);

			if (!vector) {
				return null;
			}

			return {
				id: memoryId,
				content: (vector.metadata?.content as string) || undefined,
				metadata: vector.metadata,
			};
		} catch (error) {
			console.error(`Failed to retrieve memory ${memoryId}:`, error);
			throw new Error(
				`Failed to retrieve memory: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get memory service statistics
	 */
	async getStats(): Promise<MemoryStats> {
		try {
			const eizenStats = await eizenService.getStats();
			const embeddingInfo = embeddingService.getInfo();

			return {
				totalMemories: eizenStats.totalVectors,
				embeddingService: embeddingInfo.isInitialized
					? "xenova"
					: "unavailable",
				isInitialized: eizenStats.isInitialized && embeddingInfo.isInitialized,
			};
		} catch (error) {
			console.error("Failed to get memory stats:", error);
			return {
				totalMemories: 0,
				embeddingService: "unavailable",
				isInitialized: false,
			};
		}
	}

	/**
	 * Convert text to vector embeddings using the EmbeddingService
	 */
	private async textToEmbeddings(text: string): Promise<number[]> {
		try {
			console.log("Converting text to embeddings using Xenova/transformers");

			const result = await embeddingService.textToEmbeddings(text);
			return result.embeddings;
		} catch (error) {
			console.error("Failed to generate embeddings:", error);
			throw new Error(
				`Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Apply search filters to memory results
	 */
	private applyFilters(
		memories: MemoryResult[],
		filters?: SearchFilters,
	): MemoryResult[] {
		if (!filters) {
			return memories;
		}

		return memories.filter((memory) => {
			if (!memory.metadata) return true;

			// Filter by tags
			if (filters.tags && Array.isArray(filters.tags)) {
				const memoryTags = (memory.metadata.tags as string[]) || [];
				const hasRequiredTags = filters.tags.some((tag: string) =>
					memoryTags.includes(tag),
				);
				if (!hasRequiredTags) return false;
			}

			// Filter by minimum importance
			if (
				filters.importance_min &&
				typeof filters.importance_min === "number"
			) {
				const importance = (memory.metadata.importance as number) || 0;
				if (importance < filters.importance_min) return false;
			}

			// Filter by client
			if (filters.client && typeof filters.client === "string") {
				const client = (memory.metadata.client as string) || "";
				if (!client.includes(filters.client)) return false;
			}

			// Filter by date range
			if (filters.date_from || filters.date_to) {
				const timestamp =
					(memory.metadata.timestamp as string) ||
					(memory.metadata.createdAt as string);
				if (timestamp) {
					const memoryDate = new Date(timestamp);
					if (filters.date_from && memoryDate < new Date(filters.date_from))
						return false;
					if (filters.date_to && memoryDate > new Date(filters.date_to))
						return false;
				}
			}

			return true;
		});
	}
}

// Create singleton instance
export const memoryService = new MemoryService();
