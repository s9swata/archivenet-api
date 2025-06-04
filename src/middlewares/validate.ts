import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export const validate =
	<T>(Schema: ZodSchema<T>) =>
	(req: Request, res: Response, next: NextFunction) => {
		const result = Schema.safeParse(req.body);
		if (!result.success) {
			return res
				.status(400)
				.json({ success: false, errors: result.error.errors });
		}
		next();
	};
