import { body } from "express-validator";

export const createAlbumRules = [
	body("title")
		.isString()
		.withMessage("has to be a string")
		.bail()
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),
];

export const updateAlbumRules = [
	body("title")
		.optional()
		.isString()
		.withMessage("has to be a string")
		.bail()
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),
];
