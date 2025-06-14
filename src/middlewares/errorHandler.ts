import type { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/responses.js";

export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	console.error("Global error handler:", err);

	const response = errorResponse(
		"Internal server error",
		err instanceof Error ? err.message : "Unknown error",
	);

	res.status(500).json(response);
}
