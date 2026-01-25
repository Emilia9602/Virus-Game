import express from "express";
import { destroy, index, show, store, update } from "../controllers/_resource.controller.ts";

// Create a Resource router
export const resourcesRouter = express.Router();

/**
 * GET /resources
 *
 * Get all resources
 */
resourcesRouter.get("/", index);

/**
 * GET /resources/:resourceId
 *
 * Get a single resource
 */
resourcesRouter.get("/:resourceId", show);

/**
 * POST /resources
 *
 * Create an resource
 */
resourcesRouter.post("/", store);

/**
 * PATCH /resources/:resourceId
 *
 * Update a single resource
 */
resourcesRouter.patch("/:resourceId", update);

/**
 * DELETE /resources/:resourceId
 *
 * Delete a single resource
 */
resourcesRouter.delete("/:resourceId", destroy);
