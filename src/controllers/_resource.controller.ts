/**
 * Resource Controller (TEMPLATE)
 */
import Debug from "debug";
import { Request, Response } from "express";

// Create a new debug instance
const debug = Debug('prisma-boilerplate:I_AM_LAZY_AND_HAVE_NOT_CHANGED_THIS_😛');
debug("Resource controller loaded - BUT you SHOULDN'T BE SEEING THIS MESSAGE AT ALL if you have changed the file name from _resource.controller.ts to your actual resource name!");

/**
 * Get all resources
 */
export const index = async (_req: Request, res: Response) => {
	res.status(501).send();
}

/**
 * Get a single resource
 */
export const show = async (req: Request, res: Response) => {
	res.status(501).send();
}

/**
 * Create an resource
 */
export const store = async (req: Request, res: Response) => {
	res.status(501).send();
}

/**
 * Update a single resource
 */
export const update = async (req: Request, res: Response) => {
	res.status(501).send();
}

/**
 * Delete a single resource
 */
export const destroy = async (req: Request, res: Response) => {
	res.status(501).send();
}
