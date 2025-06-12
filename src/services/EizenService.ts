import { EizenDbVector } from "eizen";
import { SetSDK } from "hollowdb";
import { type ArweaveConfig, initializeArweave } from "../config/arweave.js";
import type {
	InsertVector,
	SearchVector,
	VectorEmbedding,
	VectorMetadata,
} from "../schemas/eizen.js";

export interface EizenSearchResult {
	id: number;
	distance: number;
	metadata?: VectorMetadata;
}

export interface EizenInsertResult {
	success: boolean;
	vectorId: number;
	message: string;
}

/**
 * Service class for Eizen vector database operations
 * Handles vector storage, retrieval, and similarity search
 */
export class EizenService {
	private vectorDb: EizenDbVector<VectorMetadata> | null = null;
	private sdk: SetSDK<string> | null = null;
	private arweaveConfig: ArweaveConfig | null = null;
	private isInitialized = false;

	constructor() {
		// Initialize asynchronously
		this.initialize().catch((error) => {
			console.error("Failed to initialize EizenService:", error);
		});
	}

	/**
	 * Initialize Arweave and Eizen components
	 */
	private async initialize(): Promise<void> {
		try {
			console.log("Initializing EizenService...");

			// Initialize Arweave configuration
			this.arweaveConfig = await initializeArweave();

			// Get contract ID from environment
			const contractTxId = process.env.EIZEN_CONTRACT_ID;
			if (!contractTxId) {
				throw new Error("EIZEN_CONTRACT_ID environment variable is required");
			}

			// Create HollowDB SDK instance
			this.sdk = new SetSDK<string>(
				this.arweaveConfig.wallet,
				contractTxId,
				this.arweaveConfig.warp,
			);

			// Create Eizen vector database with configuration
			const options = {
				m: Number(process.env.EIZEN_M) || 16,
				efConstruction: Number(process.env.EIZEN_EF_CONSTRUCTION) || 200,
				efSearch: Number(process.env.EIZEN_EF_SEARCH) || 50,
			};

			this.vectorDb = new EizenDbVector<VectorMetadata>(this.sdk, options);

			this.isInitialized = true;
			console.log("EizenService initialized successfully");
			console.log(
				`HNSW Parameters: m=${options.m}, efConstruction=${options.efConstruction}, efSearch=${options.efSearch}`,
			);
		} catch (error) {
			console.error("EizenService initialization failed:", error);
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

		if (!this.vectorDb) {
			throw new Error("EizenService is not properly initialized");
		}
	}

	/**
	 * Insert a vector with metadata into the database
	 */
	async insertVector(data: InsertVector): Promise<EizenInsertResult> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error("Vector database not initialized");
		}

		try {
			console.log(`Inserting vector with ${data.vector.length} dimensions`);

			// Insert vector using Eizen - it returns void, so we need to track the next ID
			const currentVectorCount = await this.getVectorCount();
			await this.vectorDb.insert(data.vector, data.metadata);

			// Assuming the next vector ID is the current count (this is a simplification)
			const vectorId = currentVectorCount;

			console.log(
				`Vector inserted successfully with estimated ID: ${vectorId}`,
			);

			return {
				success: true,
				vectorId,
				message: `Vector inserted successfully with estimated ID: ${vectorId}`,
			};
		} catch (error) {
			console.error("Failed to insert vector:", error);
			throw new Error(
				`Failed to insert vector: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Search for similar vectors using k-nearest neighbors
	 */
	async searchVectors(data: SearchVector): Promise<EizenSearchResult[]> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error("Vector database not initialized");
		}

		try {
			console.log(`Searching for ${data.k} nearest neighbors`);

			// Perform KNN search using Eizen
			const results = await this.vectorDb.knn_search(data.query, data.k);

			console.log(`Found ${results.length} similar vectors`);

			return results.map((result) => ({
				id: result.id,
				distance: result.distance,
				metadata: result.metadata || undefined,
			}));
		} catch (error) {
			console.error("Failed to search vectors:", error);
			throw new Error(
				`Failed to search vectors: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get a specific vector by its ID
	 */
	async getVector(
		vectorId: number,
	): Promise<{ point: VectorEmbedding; metadata?: VectorMetadata } | null> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error("Vector database not initialized");
		}

		try {
			console.log(`Retrieving vector with ID: ${vectorId}`);

			const result = await this.vectorDb.get_vector(vectorId);

			if (result) {
				console.log(`Vector ${vectorId} retrieved successfully`);
				return {
					point: result.point,
					metadata: result.metadata || undefined,
				};
			}

			console.log(`Vector ${vectorId} not found`);
			return null;
		} catch (error) {
			console.error(`Failed to retrieve vector ${vectorId}:`, error);
			throw new Error(
				`Failed to retrieve vector: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Deploy a new Eizen contract (for setup purposes)
	 */
	async deployContract(): Promise<string> {
		await this.ensureInitialized();

		if (!this.arweaveConfig) {
			throw new Error("Arweave configuration not available");
		}

		try {
			console.log("Deploying new Eizen contract...");

			const { contractTxId } = await EizenDbVector.deploy(
				this.arweaveConfig.wallet,
				this.arweaveConfig.warp,
			);

			console.log(`Eizen contract deployed successfully: ${contractTxId}`);
			return contractTxId;
		} catch (error) {
			console.error("Failed to deploy contract:", error);
			throw new Error(
				`Failed to deploy contract: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get database statistics (if available)
	 */
	async getStats(): Promise<{ totalVectors: number; isInitialized: boolean }> {
		try {
			return {
				totalVectors: this.vectorDb ? await this.getVectorCount() : 0,
				isInitialized: this.isInitialized,
			};
		} catch (error) {
			return {
				totalVectors: 0,
				isInitialized: this.isInitialized,
			};
		}
	}

	/**
	 * Helper method to get vector count (implementation depends on Eizen API)
	 */
	private async getVectorCount(): Promise<number> {
		// This would need to be implemented based on Eizen's API
		// For now, return 0 as placeholder
		return 0;
	}

	/**
	 * Clean up resources
	 */
	async cleanup(): Promise<void> {
		try {
			if (this.arweaveConfig?.redis) {
				await this.arweaveConfig.redis.quit();
				console.log("Redis connection closed");
			}
		} catch (error) {
			console.error("Error during cleanup:", error);
		}
	}
}

// Create singleton instance
export const eizenService = new EizenService();
