import { body } from "express-validator";

export const createPhotoRules = [
	body("title")
		.isString()
		.withMessage("has to be a string")
		.bail()
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),

	body("url")
		.isURL(),

	body("comment")
		.isString()
		.withMessage("has to be a string")
		.bail()
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long")
];

export const updatePhotoRules = [
	body("title")
		.optional()
		.isString()
		.withMessage("has to be a string")
		.bail()
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),

	body("url")
		.optional()
		.isURL(),

	body("comment")
		.optional()
		.isString()
		.withMessage("has to be a string")
		.bail()
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long")
];
