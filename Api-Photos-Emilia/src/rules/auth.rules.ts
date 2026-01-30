import { body } from "express-validator";

//Log in rules

export const loginRules = [
	body("email")
		.isEmail()
		.withMessage("has to be valid email"),

	body("password")
		.isString()
		.notEmpty()
		.isLength({ min: 6 })
		.withMessage("has to be at least 6 characters long"),
];
