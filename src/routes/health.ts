import { Router } from "express";
import { EizenService } from "../services/EizenService.js";
import { embeddingService } from "../services/EmbeddingService.js";
import { MemoryService } from "../services/MemoryService.js";
import { errorResponse, successResponse } from "../utils/responses.js";

const router = Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get("/", (req, res) => {
	res.json(
		successResponse(
			{
				status: "healthy",
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				service: "ArchiveNET API",
			},
			"API is healthy",
		),
	);
});

/**
 * GET /health/detailed
 * Detailed health check including service status
 * Note: Uses fallback contract for system health checks
 */
router.get("/detailed", async (req, res) => {
	try {
		// For health checks, use fallback contract ID from environment
		// This is for system monitoring, not user-specific operations
		const fallbackContractId = process.env.EIZEN_CONTRACT_ID;

		let eizenStats = null;
		if (fallbackContractId) {
			try {
				const eizenService = await EizenService.forContract(fallbackContractId);
				eizenStats = await eizenService.getStats();
			} catch (error) {
				console.warn("Could not get Eizen stats for health check:", error);
			}
		}

		// Create memory service instance for health check
		let memoryStats = null;
		if (fallbackContractId) {
			try {
				const eizenService = await EizenService.forContract(fallbackContractId);
				const memoryService = new MemoryService(eizenService);
				memoryStats = await memoryService.getStats();
			} catch (error) {
				console.warn("Could not get Memory stats for health check:", error);
			}
		}

		// Environment info
		const environment = {
			nodeEnv: process.env.NODE_ENV,
			nodeVersion: process.version,
			platform: process.platform,
			arch: process.arch,
		};

		// Service configuration
		const embeddingInfo = embeddingService.getInfo();
		const allowedOrigins = process.env.ORIGIN?.split(",").map((origin) =>
			origin.trim(),
		) || ["http://localhost:3000"];

		const config = {
			arweaveGateway: process.env.ARWEAVE_GATEWAY,
			hasServiceWallet: !!process.env.SERVICE_WALLET_ADDRESS,
			hasEizenContract: !!process.env.EIZEN_CONTRACT_ID,
			hasRedis: !!process.env.REDIS_URL,
			embeddingService: embeddingInfo.isInitialized ? "xenova" : "unavailable",
			architecture: "multi-tenant",
			cors: {
				allowedOrigins: allowedOrigins,
				credentialsEnabled: true,
				originCount: allowedOrigins.length,
			},
		};

		const healthData = {
			status: "healthy",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			service: "ArchiveNET API",
			version: process.env.npm_package_version || "unknown",
			environment,
			config,
			services: {
				eizen: eizenStats
					? {
							initialized: eizenStats.isInitialized,
							ServiceWallet: process.env.SERVICE_WALLET_ADDRESS,
							totalVectors: eizenStats.totalVectors,
							contractId: eizenStats.contractId,
						}
					: {
							status: "no fallback contract configured",
						},
				memory: memoryStats
					? {
							initialized: memoryStats.isInitialized,
							totalMemories: memoryStats.totalMemories,
							embeddingModel: embeddingInfo.isInitialized
								? embeddingInfo.model
								: "unavailable",
						}
					: {
							status: "no fallback contract configured",
						},
			},
		};

		res.json(successResponse(healthData, "Detailed health check completed"));
	} catch (error) {
		console.error("Health check error:", error);
		res
			.status(503)
			.json(
				errorResponse(
					"Service degraded",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

/**
 * GET /health/eizen
 * Specific health check for Eizen service
 * Note: Uses fallback contract for system health checks
 */
router.get("/eizen", async (req, res) => {
	try {
		const fallbackContractId = process.env.EIZEN_CONTRACT_ID;

		if (!fallbackContractId) {
			res.json(
				successResponse(
					{
						service: "Eizen Vector Database",
						status: "not configured",
						message: "No fallback contract ID configured for health checks",
						architecture: "multi-tenant",
					},
					"Eizen service health check",
				),
			);
			return;
		}

		const eizenService = await EizenService.forContract(fallbackContractId);
		const stats = await eizenService.getStats();

		res.json(
			successResponse(
				{
					service: "Eizen Vector Database",
					status: stats.isInitialized ? "healthy" : "initializing",
					totalVectors: stats.totalVectors,
					contractId: stats.contractId,
					parameters: {
						m: process.env.EIZEN_M || 16,
						efConstruction: process.env.EIZEN_EF_CONSTRUCTION || 200,
						efSearch: process.env.EIZEN_EF_SEARCH || 50,
					},
					architecture: "multi-tenant",
				},
				"Eizen service health check",
			),
		);
	} catch (error) {
		console.error("Eizen health check error:", error);
		res
			.status(503)
			.json(
				errorResponse(
					"Eizen service error",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

/**
 * GET /health/memory
 * Specific health check for Memory service
 * Note: Uses fallback contract for system health checks
 */
router.get("/memory", async (req, res) => {
	try {
		const fallbackContractId = process.env.EIZEN_CONTRACT_ID;

		if (!fallbackContractId) {
			res.json(
				successResponse(
					{
						service: "Memory Management",
						status: "not configured",
						message: "No fallback contract ID configured for health checks",
						architecture: "multi-tenant",
					},
					"Memory service health check",
				),
			);
			return;
		}

		const eizenService = await EizenService.forContract(fallbackContractId);
		const memoryService = new MemoryService(eizenService);
		const stats = await memoryService.getStats();

		res.json(
			successResponse(
				{
					service: "Memory Management",
					status: stats.isInitialized ? "healthy" : "initializing",
					totalMemories: stats.totalMemories,
					embeddingService: stats.embeddingService,
					configuration: {
						embeddingService: stats.embeddingService,
						embeddingModel: embeddingService.getInfo().model,
					},
					architecture: "multi-tenant",
				},
				"Memory service health check",
			),
		);
	} catch (error) {
		console.error("Memory health check error:", error);
		res
			.status(503)
			.json(
				errorResponse(
					"Memory service error",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

export default router;
