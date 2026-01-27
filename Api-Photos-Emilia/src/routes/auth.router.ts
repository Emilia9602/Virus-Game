import express from "express";

export const authRouter = express.Router();

//Register a new user
authRouter.post("/register"); // Regler, validering, funktion

//Log in a user
authRouter.post("/login"); // Regler, validering, funktion

//Get a new access token
authRouter.post("/refresh"); // Funktion
