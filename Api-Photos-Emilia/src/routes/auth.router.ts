import express from "express";
import { login, refresh, register } from "../controllers/auth.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { loginRules } from "../rules/auth.rules.ts";
import { createUserRules } from "../rules/user.rules.ts";

export const authRouter = express.Router();

//Register a new user
authRouter.post("/register", createUserRules, validateRequest, register);

//Log in a user
authRouter.post("/login", loginRules, validateRequest, login);

//Get a new access token
authRouter.post("/refresh", refresh);
