import { type Request, type Response, Router } from "express";
import { validateData } from "../middlewares/validate.js";
import { insertVectorSchema, searchVectorSchema } from "../schemas/eizen.js";
import { EizenService } from "../services/EizenService.js";
import { errorResponse, successResponse } from "../utils/responses.js";

const router = Router();

// TODO: Replace this with actual user lookup from SQL database
// This will be implemented when payment gateway integration is added
async function getUserEizenService(req: Request): Promise<EizenService> {
	// TODO: Extract API key from request headers
	// const apiKey = req.headers['x-api-key'] as string;

	// TODO: Look up user's contract ID from database
	// const user = await getUserByApiKey(apiKey);
	// return await EizenService.forContract(user.contractId);

	// For now, use environment variable as fallback (single tenant mode)
	const contractId = process.env.EIZEN_CONTRACT_ID;
	if (!contractId) {
		throw new Error(
			"No contract ID available. Please implement user lookup or set EIZEN_CONTRACT_ID",
		);
	}

	return await EizenService.forContract(contractId);
}

/**
 * POST /vectors/insert
 * Insert a vector with optional metadata into the Eizen database
 *
 * Request body:
 * {
 *   "vector": [0.1, 0.2, 0.3, ...],
 *   "metadata": { "key": "value", ... } // optional
 * }
 */
router.post("/insert", validateData(insertVectorSchema), async (req, res) => {
	try {
		const eizenService = await getUserEizenService(req);
		const result = await eizenService.insertVector(req.body);

		res
			.status(201)
			.json(successResponse(result, "Vector inserted successfully"));
	} catch (error) {
		console.error("Vector insert error:", error);
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
 * POST /vectors/search
 * Search for similar vectors using k-nearest neighbors
 *
 * Request body:
 * {
 *   "query": [0.1, 0.2, 0.3, ...],
 *   "k": 10 // optional, defaults to 10
 * }
 */
router.post("/search", validateData(searchVectorSchema), async (req, res) => {
	try {
		const eizenService = await getUserEizenService(req);
		const results = await eizenService.searchVectors(req.body);

		res.json(
			successResponse(results, `Found ${results.length} similar vectors`),
		);
	} catch (error) {
		console.error("Vector search error:", error);
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
 * GET /vectors/:id
 * Get a specific vector by its ID
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		const eizenService = await getUserEizenService(req);
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
		console.error("Vector get error:", error);
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
 * GET /vectors/stats
 * Get database statistics
 */
router.get("/", async (req, res) => {
	try {
		const eizenService = await getUserEizenService(req);
		const stats = await eizenService.getStats();

		res.json(successResponse(stats, "Database statistics retrieved"));
	} catch (error) {
		console.error("Stats error:", error);
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
 * POST /vectors/deploy
 * Deploy a new Eizen contract (admin operation)
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
		console.error("Contract deploy error:", error);
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
