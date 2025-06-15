import { type Request, type Response, Router } from "express";
import { validateData } from "../middlewares/validate.js";
import { insertVectorSchema, searchVectorSchema } from "../schemas/eizen.js";
import { EizenService } from "../services/EizenService.js";
import { errorResponse, successResponse } from "../utils/responses.js";

/**
 * ADMIN ROUTES - ArchiveNET Vector Database Administration
 *
 * These routes provide direct low-level access to the Eizen vector database
 * for administrative purposes only. They are NOT intended for public use.
 *
 * Access Level: ADMIN ONLY
 * Authentication: Environment-based (EIZEN_CONTRACT_ID)
 *
 * Use Cases:
 * - Direct vector manipulation for testing
 * - Database administration and monitoring
 * - System debugging and maintenance
 * - Contract deployment for new instances
 *
 * Security Note: These endpoints bypass user authentication and operate
 * directly on the configured admin contract. (Will private this endpoint later)
 */

const router = Router();

/**
 * Get admin Eizen service instance
 * Uses the contract ID from environment variables for admin operations
 *
 * @param req - Express request object (unused, kept for consistency)
 * @returns Promise<EizenService> - Admin Eizen service instance
 * @throws Error if EIZEN_CONTRACT_ID is not configured
 */
async function getAdminEizenService(req: Request): Promise<EizenService> {
	const contractId = process.env.EIZEN_CONTRACT_ID;

	if (!contractId) {
		throw new Error(
			"EIZEN_CONTRACT_ID not set in environment variables. Admin operations are limited. Please configure the admin contract ID to enable full functionality.",
		);
	}

	return await EizenService.forContract(contractId);
}

/**
 * POST /admin/insert
 * Insert a vector with optional metadata into the Eizen database
 *
 * Admin Use Case: Direct vector insertion for testing and data seeding
 *
 * Request body:
 * {
 *   "vector": [0.1, 0.2, 0.3, ...],  // Raw vector data (float array)
 *   "metadata": { "key": "value", ... } // Optional metadata object
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { "vectorId": 123 },
 *   "message": "Vector inserted successfully"
 * }
 */
router.post("/insert", validateData(insertVectorSchema), async (req, res) => {
	try {
		const eizenService = await getAdminEizenService(req);
		const result = await eizenService.insertVector(req.body);

		res
			.status(201)
			.json(successResponse(result, "Vector inserted successfully"));
	} catch (error) {
		console.error("Admin vector insert error:", error);
		res
			.status(500)
			.json(
				errorResponse(
					"Failed to insert vector",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

/**
 * POST /admin/search
 * Search for similar vectors using k-nearest neighbors
 *
 * Admin Use Case: Direct vector similarity search for testing and debugging
 *
 * Request body:
 * {
 *   "query": [0.1, 0.2, 0.3, ...],  // Query vector (float array)
 *   "k": 10                         // Number of results (optional, defaults to 10)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": 123, "distance": 0.15, "metadata": {...} },
 *     { "id": 456, "distance": 0.23, "metadata": {...} }
 *   ],
 *   "message": "Found 2 similar vectors"
 * }
 */
router.post("/search", validateData(searchVectorSchema), async (req, res) => {
	try {
		const eizenService = await getAdminEizenService(req);
		const results = await eizenService.searchVectors(req.body);

		res.json(
			successResponse(results, `Found ${results.length} similar vectors`),
		);
	} catch (error) {
		console.error("Admin vector search error:", error);
		res
			.status(500)
			.json(
				errorResponse(
					"Failed to search vectors",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

/**
 * GET /admin/vector/:id
 * Get a specific vector by its ID
 *
 * Admin Use Case: Direct vector retrieval for debugging and data inspection
 *
 * URL Parameters:
 * - id: Vector ID (integer)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 123,
 *     "vector": [0.1, 0.2, 0.3, ...],
 *     "metadata": { ... }
 *   },
 *   "message": "Vector retrieved successfully"
 * }
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		const eizenService = await getAdminEizenService(req);
		const vectorId = Number.parseInt(req.params.id, 10);

		if (Number.isNaN(vectorId)) {
			res
				.status(400)
				.json(errorResponse("Invalid vector ID", "Vector ID must be a number"));
			return;
		}

		const vector = await eizenService.getVector(vectorId);

		if (!vector) {
			res
				.status(404)
				.json(
					errorResponse(
						"Vector not found",
						`No vector found with ID: ${vectorId}`,
					),
				);
			return;
		}

		res.json(successResponse(vector, "Vector retrieved successfully"));
	} catch (error) {
		console.error("Admin vector get error:", error);
		res
			.status(500)
			.json(
				errorResponse(
					"Failed to retrieve vector",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

/**
 * GET /admin/stats
 * Get database statistics and system information
 *
 * Admin Use Case: Monitor database health, storage metrics, and performance stats
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "totalVectors": 1234,
 *     "isInitialized": true,
 *     "memoryUsage": "45.2MB",
 *     "lastUpdated": "2025-06-15T10:30:00Z"
 *   },
 *   "message": "Database statistics retrieved"
 * }
 */
router.get("/", async (req, res) => {
	try {
		const eizenService = await getAdminEizenService(req);
		const stats = await eizenService.getStats();

		res.json(successResponse(stats, "Database statistics retrieved"));
	} catch (error) {
		console.error("Admin stats error:", error);
		res
			.status(500)
			.json(
				errorResponse(
					"Failed to get database statistics",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

/**
 * POST /admin/deploy
 * Deploy a new Eizen contract (admin operation)
 *
 * Admin Use Case: Deploy new contract instances for system scaling or testing
 *
 * Response:
 * {
 *   "success": true,
 *   "data": { "contractTxId": "abc123..." },
 *   "message": "Eizen contract deployed successfully"
 * }
 *
 * Note: This operation creates a new contract on Arweave blockchain
 * and returns the transaction ID for the deployed contract.
 */
router.post("/deploy", async (req, res) => {
	try {
		const deployResult = await EizenService.deployNewContract();
		const contractTxId = deployResult.contractId;

		res
			.status(201)
			.json(
				successResponse(
					{ contractTxId },
					"Eizen contract deployed successfully",
				),
			);
	} catch (error) {
		console.error("Admin contract deploy error:", error);
		res
			.status(500)
			.json(
				errorResponse(
					"Failed to deploy contract",
					error instanceof Error ? error.message : "Unknown error",
				),
			);
	}
});

export default router;
