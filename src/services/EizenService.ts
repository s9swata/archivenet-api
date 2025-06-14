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
	distance: number; // Distance/similarity score (lower value == higher similarity)
	metadata?: VectorMetadata;
}

export interface EizenInsertResult {
	success: boolean;
	vectorId: number;
	message: string;
}

/**
 * Service class for managing Eizen vector database operations
 *
 * This service provides a high-level interface for:
 * - Vector storage and retrieval
 * - Similarity search using HNSW (Hierarchical Navigable Small World) algorithm
 * - Database statistics and management
 *
 * The service uses Arweave for decentralized storage and HollowDB as the underlying data layer.
 * Vectors are stored with configurable HNSW parameters for optimal search performance.
 *
 * @see https://github.com/Itz-Agasta/Eizendb/blob/main/docs/DEVELOPER_GUIDE.md Official Eizen docs
 * 
 * @example
 * ```typescript
 * // Insert a vector
 * const result = await eizenService.insertVector({
 *   vector: [0.1, 0.2, 0.3, ...],
 *   metadata: { Id: "a_we123...", "content": "User's favorite color is blue",
    "context": "preference setting" }
 * });
 *
 * // Search for similar vectors
 * const similar = await eizenService.searchVectors({
 *   query: [0.1, 0.2, 0.3, ...],
 *   k: 5
 * });
 * ```
 */
export class EizenService {
	private vectorDb: EizenDbVector<VectorMetadata> | null = null; // The Eizen vector database instance with generic metadata type
	private sdk: SetSDK<string> | null = null; // HollowDB SDK instance for Arweave interactions
	private arweaveConfig: ArweaveConfig | null = null; //  Arweave configuration containing wallet, warp, and redis instances
	private isInitialized = false;

	/**
	 * Creates a new EizenService instance and begins asynchronous initialization
	 *
	 * Note: The constructor starts initialization but doesn't wait for completion.
	 * All public methods will automatically wait for initialization via ensureInitialized().
	 */
	constructor() {
		this.initialize().catch((error) => {
			console.error("Failed to initialize EizenService:", error);
		});
	}

	/**
	 * Initialize Arweave configuration and Eizen vector database
	 *
	 * This method:
	 * 1. Sets up Arweave wallet and warp instance
	 * 2. Creates HollowDB SDK with the contract ID
	 * 3. Initializes EizenDbVector with HNSW parameters
	 *
	 * HNSW Parameters (configured via environment variables):
	 * - m: Number of bi-directional links for each new element (default: 16)
	 * - efConstruction: Size of dynamic candidate list during construction (default: 200)
	 * - efSearch: Size of dynamic candidate list during search (default: 50)
	 *
	 * @private
	 * @throws {Error} When EIZEN_CONTRACT_ID is missing or initialization fails
	 */
	private async initialize(): Promise<void> {
		try {
			console.log("Initializing EizenService...");

			// Step 1: Initialize Arweave configuration (wallet, warp, redis)
			this.arweaveConfig = await initializeArweave();

			// Step 2: Validate required environment variables
			const contractTxId = process.env.EIZEN_CONTRACT_ID; //FIXME: idk have to look at it
			if (!contractTxId) {
				throw new Error("EIZEN_CONTRACT_ID environment variable is required");
			}

			// Step 3: Create HollowDB SDK instance for Arweave smart contract interactions
			this.sdk = new SetSDK<string>(
				this.arweaveConfig.wallet,
				contractTxId,
				this.arweaveConfig.warp,
			);

			// Step 4: Configure HNSW algorithm parameters from environment or use defaults
			const options = {
				m: Number(process.env.EIZEN_M) || 16, // Maximum number of bi-directional links for each element
				efConstruction: Number(process.env.EIZEN_EF_CONSTRUCTION) || 200, // Dynamic candidate list size during index construction (higher == better quality == slower build)
				efSearch: Number(process.env.EIZEN_EF_SEARCH) || 50, // Dynamic candidate list size during search (higher == better accuracy == slower search)
			};

			// Step 5: Create the Eizen vector database instance with configured parameters
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
	 * Ensures the service is fully initialized before performing operations
	 *
	 * This method is called by all public methods to guarantee that the service
	 * is ready for use. It will wait for initialization if it's still in progress.
	 *
	 * @private
	 * @throws {Error} When the service fails to initialize properly
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
	 * Insert a vector with associated metadata into the database
	 *
	 * The vector will be added to the HNSW index for future similarity searches.
	 * Each vector must have consistent dimensionality with existing vectors in the database.
	 *
	 * @param data - The vector data and metadata to insert
	 * @param data.vector - The numerical vector representation (e.g., embeddings)
	 * @param data.metadata - Associated metadata (document ID, type, etc.)
	 * @returns Promise resolving to insertion result with assigned vector ID //TODO: setup the vectorID tracking
	 *
	 * @example
	 * ```typescript
	 * const result = await eizenService.insertVector({
	 *   vector: [0.1, 0.2, 0.3, 0.4, 0.5],
	 *   metadata: {
	 *  		"content": "User's favorite color is blue",
	 *  		"context": "preference setting",
	 * 			"importance": 7,
	 * 			"tags": ["preference", "color", "personal"],
	 * 			"timestamp": "2025-06-06T14:30:00Z",
	 * 			"client": "cursor"
	 * 		}
	 * });
	 *
	 * if (result.success) {
	 *   console.log(`Vector stored with ID: ${result.vectorId}`);
	 * }
	 * ```
	 *
	 * @throws {Error} When the service is not initialized or insertion fails
	 */
	async insertVector(data: InsertVector): Promise<EizenInsertResult> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error("Vector database not initialized");
		}

		try {
			console.log(`Inserting vector with ${data.vector.length} dimensions`);

			// Get current vector count to estimate the next ID
			// TODO: implement getVectorCount() with neonDB later
			const currentVectorCount = await this.getVectorCount();

			// Insert vector into the HNSW index with associated metadata
			await this.vectorDb.insert(data.vector, data.metadata);

			// Estimate the vector ID
			const vectorId = currentVectorCount; //NOTE: getVectorCount() is not implemented yet. so VectorID is 0 for every insert.

			console.log(
				`Vector inserted successfully with estimated ID: ${vectorId}`,
			);

			return {
				success: true,
				vectorId, // For now it will always return 0
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
	 * Search for the k most similar vectors using the HNSW algorithm
	 *
	 * This method performs approximate nearest neighbor search to find vectors
	 * most similar to the query vector. Results are ordered by similarity
	 * (lower distance = higher similarity).
	 *
	 * @param data - Search parameters
	 * @param data.query - The query vector to find similar vectors for
	 * @param data.k - Number of nearest neighbors to return (must be > 0)
	 * @returns Promise resolving to array of similar vectors with distances and metadata
	 *
	 * @example
	 * ```typescript
	 * // Find 5 most similar vectors
	 * const results = await eizenService.searchVectors({
	 *   query: [0.1, 0.2, 0.3, 0.4, 0.5],
	 *   k: 5
	 * });
	 *
	 * results.forEach((result, index) => {
	 *   console.log(`${index + 1}. Vector ID: ${result.id}, Distance: ${result.distance}`);
	 *   if (result.metadata) {
	 *     console.log(`   Metadata:`, result.metadata);
	 *   }
	 * });
	 * ```
	 *
	 * @throws {Error} When the service is not initialized or search fails
	 */
	async searchVectors(data: SearchVector): Promise<EizenSearchResult[]> {
		await this.ensureInitialized();

		if (!this.vectorDb) {
			throw new Error("Vector database not initialized");
		}

		try {
			console.log(`Searching for ${data.k} nearest neighbors`);

			// Perform k-nearest neighbor search using HNSW algorithm
			const results = await this.vectorDb.knn_search(data.query, data.k);

			console.log(`Found ${results.length} similar vectors`);

			// Transform results to match our interface
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
	 * Retrieve a specific vector by its unique ID
	 *
	 * This method allows direct access to a vector and its metadata using
	 * the ID returned from previous insert or search operations.
	 *
	 * @param vectorId - The unique identifier of the vector to retrieve
	 * @returns Promise resolving to vector data and metadata, or null if not found
	 *
	 * @example
	 * ```typescript
	 * const vector = await eizenService.getVector(123);
	 *
	 * if (vector) {
	 *   console.log(`Vector dimensions: ${vector.point.length}`);
	 *   console.log(`Metadata:`, vector.metadata);
	 * } else {
	 *   console.log('Vector not found');
	 * }
	 * ```
	 *
	 * @throws {Error} When the service is not initialized or retrieval fails
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

			// Fetch vector data by ID from the database
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
	 * Deploy a new Eizen smart contract to Arweave
	 *
	 * This method is primarily used for initial setup or creating new isolated
	 * vector databases. The returned contract ID should be set as EIZEN_CONTRACT_ID
	 * in your environment variables.
	 *
	 * @returns Promise resolving to the deployed `contract transaction ID`
	 *
	 * @example
	 * ```typescript
	 * // Deploy a new contract (typically done once during setup for each user)
	 * const contractId = await eizenService.deployContract();
	 * console.log(`New contract deployed: ${contractId}`);
	 * // Set this as EIZEN_CONTRACT_ID in your environment
	 * ```
	 *
	 * @throws {Error} When Arweave config is unavailable or deployment fails
	 */
	async deployContract(): Promise<string> {
		await this.ensureInitialized();

		if (!this.arweaveConfig) {
			throw new Error("Arweave configuration not available");
		}

		try {
			console.log("Deploying new Eizen contract...");

			// Deploy new contract to Arweave using the configured wallet and warp instance
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
	 * Get database statistics and service status
	 *
	 * Provides information about the current state of the vector database,
	 * including the total number of stored vectors and initialization status.
	 *
	 * @returns Promise resolving to database statistics (0 for now)
	 *
	 * @todo Implement it via service NEON db
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
	 * Get the total number of vectors in the database via our service NEON db
	 *
	 * This is a helper method used internally for statistics and ID estimation.
	 *
	 * @private
	 * @returns Promise resolving to the vector count
	 * @todo Implement it via service NEON db
	 */
	private async getVectorCount(): Promise<number> {
		return 0; // Placeholder value for now
	}

	/**
	 * Clean up service resources and close connections
	 *
	 * This method should be called when shutting down the application
	 * to properly close database connections and free resources.
	 *
	 * @example
	 * ```typescript
	 * // During application shutdown
	 * await eizenService.cleanup();
	 * ```
	 */
	async cleanup(): Promise<void> {
		try {
			// Close Redis connection if it exists
			if (this.arweaveConfig?.redis) {
				await this.arweaveConfig.redis.quit();
				console.log("Redis connection closed");
			}
			// Reset initialization state
			this.isInitialized = false;
		} catch (error) {
			console.error("Error during cleanup:", error);
		}
	}
}

//Singleton instance of EizenService
export const eizenService = new EizenService();
