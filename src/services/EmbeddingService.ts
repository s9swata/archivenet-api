import { pipeline } from "@xenova/transformers";
import type { VectorEmbedding } from "../schemas/eizen.js";

// Type for the embedding pipeline function
type EmbeddingPipeline = (
	texts: string[],
	options?: { pooling?: string; normalize?: boolean },
) => Promise<{
	data: Float32Array | number[];
	dims: number[];
}>;

export interface EmbeddingResult {
	embeddings: VectorEmbedding;
	dimensions: number;
	model: string;
}

/**
 * Service class for converting text to vector embeddings using Xenova/transformers
 * Handles text embedding generation for memory storage in Eizen
 */
export class EmbeddingService {
	private extractor: EmbeddingPipeline | null = null;
	private isInitialized = false;
	private readonly modelName = "Xenova/all-MiniLM-L6-v2";

	constructor() {
		// Initialize asynchronously
		this.initialize().catch((error) => {
			console.error("Failed to initialize EmbeddingService:", error);
		});
	}

	/**
	 * Initialize the embedding pipeline
	 */
	private async initialize(): Promise<void> {
		try {
			console.log("Initializing EmbeddingService...");
			console.log(`Loading model: ${this.modelName}`);

			this.extractor = (await pipeline(
				"feature-extraction",
				this.modelName,
			)) as EmbeddingPipeline;

			this.isInitialized = true;
			console.log("EmbeddingService initialized successfully");
		} catch (error) {
			console.error("EmbeddingService initialization failed:", error);
			throw error;
		}
	}

	/**
	 * Ensure the service is initialized before operations
	 */
	private async ensureInitialized(): Promise<void> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.extractor) {
			throw new Error("EmbeddingService is not properly initialized");
		}
	}

	/**
	 * Convert text to vector embeddings
	 */
	async textToEmbeddings(text: string): Promise<EmbeddingResult> {
		await this.ensureInitialized();

		if (!this.extractor) {
			throw new Error("Extractor not initialized");
		}

		try {
			console.log(
				`Converting text to embeddings: "${text.substring(0, 50)}..."`,
			);

			const response = await this.extractor([text], {
				pooling: "mean",
				normalize: true,
			});

			const embeddings: VectorEmbedding = Array.from(response.data);

			console.log(`Generated ${embeddings.length}-dimensional embeddings`);

			return {
				embeddings,
				dimensions: embeddings.length,
				model: this.modelName,
			};
		} catch (error) {
			console.error("Failed to generate embeddings:", error);
			throw new Error(
				`Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Convert multiple texts to embeddings in batch
	 */
	async batchTextToEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
		await this.ensureInitialized();

		if (!this.extractor) {
			throw new Error("Extractor not initialized");
		}

		try {
			console.log(`Converting ${texts.length} texts to embeddings (batch)`);

			const response = await this.extractor(texts, {
				pooling: "mean",
				normalize: true,
			});

			const results: EmbeddingResult[] = [];
			for (let i = 0; i < texts.length; i++) {
				const startIdx = i * response.dims[1];
				const endIdx = startIdx + response.dims[1];
				const embeddings: VectorEmbedding = Array.from(
					response.data.slice(startIdx, endIdx),
				);

				results.push({
					embeddings,
					dimensions: embeddings.length,
					model: this.modelName,
				});
			}

			console.log(`Generated embeddings for ${results.length} texts`);
			return results;
		} catch (error) {
			console.error("Failed to generate batch embeddings:", error);
			throw new Error(
				`Failed to generate batch embeddings: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get embedding service information
	 */
	getInfo(): { model: string; isInitialized: boolean } {
		return {
			model: this.modelName,
			isInitialized: this.isInitialized,
		};
	}
}

// Create singleton instance
export const embeddingService = new EmbeddingService();
