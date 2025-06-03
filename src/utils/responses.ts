import type { Response } from "express";

export function successResponse(
	res: Response,
	data: unknown,
	message = "success",
) {
	return res.status(200).json({ success: true, message, data });
}

export function errorResponse(res: Response, status: number, error: unknown) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	return res.status(status).json({ success: false, error: errorMessage });
}
