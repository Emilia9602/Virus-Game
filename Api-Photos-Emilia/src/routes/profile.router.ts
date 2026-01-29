import express from "express";
import { getProfile, updateProfile } from "../controllers/profile.controller.ts";

export const profileRouter = express.Router();

//Get the user's profile
profileRouter.get("/", getProfile);

//Update the user's profile
profileRouter.patch("/", updateProfile); // Regler, validering
