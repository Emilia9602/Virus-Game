import { body } from "express-validator";
import { getUserByEmail } from "../services/user.service.ts";

//Validate if the email already exists

/**
 * @param email Email
 * @returns
 */

const validateEmailDoesNotExist = async (email: string) => {

	const user = await getUserByEmail(email);

	if (user) {
		throw new Error("Email already exists");
	}
}

export const createUserRules = [
	body("email")
		.trim()
		.isEmail()
		.withMessage("has to be valid email")
		.bail()
		.custom(validateEmailDoesNotExist),

	body("password")
		.isString()
		.withMessage("has to be a string")
		.bail()
		.notEmpty()
		.isLength({ min: 6 })
		.withMessage("has to be at least 6 characters long"),

	body("first_name")
		.isString()
		.withMessage("has to be a string")
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),

	body("last_name")
		.isString()
		.withMessage("has to be a string")
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),
];

export const updateUserRules = [
	body("email")
		.optional()
		.trim()
		.isEmail()
		.withMessage("has to be valid email")
		.bail()
		.custom(validateEmailDoesNotExist),

	body("password")
		.optional()
		.isString()
		.withMessage("has to be a string")
		.bail()
		.notEmpty()
		.isLength({ min: 6 })
		.withMessage("has to be at least 6 characters long"),

	body("first_name")
		.optional()
		.isString()
		.withMessage("has to be a string")
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),

	body("last_name")
		.optional()
		.isString()
		.withMessage("has to be a string")
		.trim()
		.isLength({ min: 3 })
		.withMessage("has to be at least 3 characters long"),
];
