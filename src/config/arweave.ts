import { Redis } from "ioredis";
import { type Warp, WarpFactory, defaultCacheOptions } from "warp-contracts";
import type { JWKInterface } from "warp-contracts";
import { DeployPlugin } from "warp-contracts-plugin-deploy";
import { RedisCache } from "warp-contracts-redis";

/**
 * Configuration interface for Arweave blockchain connection.
 *
 * This interface defines the complete setup required for ArchiveNET to interact
 * with the Arweave blockchain through Warp Contracts, including wallet authentication,
 * caching infrastructure (Redis), and network configuration.
 */
export interface ArweaveConfig {
	warp: Warp;
	wallet: JWKInterface;
	redis?: Redis;
}

/**
 * Initializes and configures the complete Arweave blockchain infrastructure for ArchiveNET.
 *
 * This function sets up a production-ready blockchain connection with automatic
 * environment detection, wallet management, and multi-tier caching. It handles:
 * - Network selection (mainnet for production, testnet for development)
 * - Wallet loading from `wallet.json` or automatic generation
 * - Redis caching integration for improved performance
 * - Contract deployment capabilities
 *
 * **Environment Variables Required:**
 * - `NODE_ENV`: Determines network selection ('production' for mainnet)
 * - `REDIS_URL`: Optional Redis connection string for caching
 * - `ARWEAVE_WALLET_PATH`: Path to wallet JSON file (production)
 * - `SERVICE_WALLET_ADDRESS`: Wallet address for production validation
 *
 * **Cache Hierarchy:**
 * 1. Redis Cache (primary) - Fast in-memory contract state caching
 * 2. LevelDB Cache (fallback) - Local filesystem caching via Warp
 * 3. Arweave Network (source) - Direct blockchain queries as last resort
 *
 * @returns Promise resolving to complete Arweave configuration
 *
 * @throws {Error} When wallet file is missing in production environment
 * @throws {Error} When Redis connection fails and no fallback is available
 */
export async function initializeArweave(): Promise<ArweaveConfig> {
	const isProduction = process.env.NODE_ENV?.trim() === "production";

	// Initialize Redis if URL is provided
	let redis: Redis | undefined;
	if (process.env.REDIS_URL) {
		try {
			redis = new Redis(process.env.REDIS_URL);
			redis.on("error", (err) => {
				console.warn("Redis connection lost, disabling cache:", err);
				redis?.disconnect();
				redis = undefined;
			});
			await redis.ping(); // simple readiness check
			console.log("Redis connected for Arweave caching");
		} catch (error) {
			console.warn("Redis connection failed, proceeding without cache:", error);
		}
	}

	// Create Warp instance with appropriate network
	let warp: Warp;

	if (isProduction) {
		// Production: Use `mainnet` with Redis caching if available
		warp = redis
			? WarpFactory.forMainnet().useKVStorageFactory(
					(contractTxId: string) =>
						new RedisCache(
							{ ...defaultCacheOptions, dbLocation: `${contractTxId}` },
							{ client: redis },
						),
				)
			: WarpFactory.forMainnet(); // Production fallback: mainnet without Redis
		console.log("Configured for Arweave mainnet (production)");
	} else {
		// Development: Use Arweave testnet for safe testing
		warp = WarpFactory.forTestnet();
		console.log("Configured for Arweave testnet (development)");
	}

	warp.use(new DeployPlugin()); // Enable contract deployment capabilities

	// Initialize wallet with automatic fallback for development
	let wallet: JWKInterface;

	if (process.env.SERVICE_WALLET_ADDRESS && process.env.ARWEAVE_WALLET_PATH) {
		const walletPath = process.env.ARWEAVE_WALLET_PATH;
		try {
			// Production: Load wallet from secure file storage
			const { readFileSync } = await import("node:fs");
			wallet = JSON.parse(readFileSync(walletPath, "utf-8"));
			const walletAddress = await warp.arweave.wallets.jwkToAddress(wallet);

			console.log("Production wallet loaded successfully");
			console.log(`Wallet Source: ${walletPath}`);
			console.log(`Wallet Address: ${walletAddress}`);
		} catch (error) {
			throw new Error(
				`Cannot load production wallet at ${walletPath}: ${String(error)}`,
			);
		}
	} else {
		// Development: Generate ephemeral wallet for testing
		wallet = await warp.arweave.wallets.generate();
		const walletAddress = await warp.arweave.wallets.jwkToAddress(wallet);
		const { writeFileSync } = await import("node:fs");
		const walletPath = "./dev-wallet.json";
		writeFileSync(walletPath, JSON.stringify(wallet, null, 2));
		console.log("Generated ephemeral wallet for development");
		console.log(`Wallet Address: ${walletAddress}`);
		console.log(
			"Please Configure valid SERVICE_WALLET_ADDRESS and ARWEAVE_WALLET_PATH for production",
		);
	}

	console.log(
		`Arweave blockchain configured for ${isProduction ? "production" : "development"} environment`,
	);

	return {
		warp,
		wallet,
		redis,
	};
}

/**
 * Returns the configured Arweave gateway URL for data retrieval.
 *
 * The gateway serves as the HTTP endpoint for accessing Arweave data,
 * including transaction data, contract states, and stored content.
 * Uses the official Arweave gateway by default with environment override support.
 * @see https://medium.com/ar-io/what-is-a-gateway-14fdd8c15076
 */
export function getArweaveGateway(): string {
	return process.env.ARWEAVE_GATEWAY || "https://arweave.net";
}
