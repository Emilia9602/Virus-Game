import express from "express";
import { getProfile } from "../controllers/profile.controller.ts";

export const profileRouter = express.Router();

//Get the user's profile
profileRouter.get("/", getProfile);

//Update the user's profile
profileRouter.patch("/"); // Regler, validering, funktion
