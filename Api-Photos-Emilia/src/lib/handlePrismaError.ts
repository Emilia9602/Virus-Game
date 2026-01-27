import type { Response } from "express";
import { Prisma } from "../../generated/prisma/client.ts";

/**
 * Handle Prisma Errors
 */
export const handlePrismaError = (res: Response, err: unknown) => {
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		// Was the value out of range?
		if (err.code === "P2020") {
			console.debug("Value out of range", err);
			res.status(400).send({ status: "error", message: "Value out of range" });
			return;
		}

		// Was it not found?
		if (err.code === "P2025") {
			console.debug("Resource not found", err);
			res.status(404).send({ status: "error", message: "Resource not found" });
			return;
		}
	}

	// Prisma validation error
	if (err instanceof Prisma.PrismaClientValidationError) {
		console.debug("Invalid request data", err);
		res.status(400).send({ status: "error", message: "Invalid request data" });
		return;
	}

	// Fallback
	console.error(err);
	res.status(500).send({ status: "error", message: "Something went wrong when querying the database" });
}
