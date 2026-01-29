import express from "express";
import { login, refresh, register } from "../controllers/auth.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";

export const authRouter = express.Router();

//Register a new user
authRouter.post("/register", validateRequest, register); // Regler

//Log in a user
authRouter.post("/login", validateRequest, login); // Regler

//Get a new access token
authRouter.post("/refresh", refresh);
