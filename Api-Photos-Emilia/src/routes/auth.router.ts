import express from "express";
import { login, refresh, register } from "../controllers/auth.controller.ts";

export const authRouter = express.Router();

//Register a new user
authRouter.post("/register", register); // Regler, validering

//Log in a user
authRouter.post("/login", login); // Regler, validering

//Get a new access token
authRouter.post("/refresh", refresh);
