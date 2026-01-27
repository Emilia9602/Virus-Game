import express from "express";

export const profileRouter = express.Router();

//Get the user's profile
profileRouter.get("/"); // Funktion

//Update the user's profile
profileRouter.patch("/"); // Regler, validering, funktion
