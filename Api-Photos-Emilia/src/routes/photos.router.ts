import express from "express";
import { index, show, store } from "../controllers/photos.controller.ts";

export const photoRouter = express.Router();

//Get all photos
photoRouter.get("/", index);

//Get a single photo
photoRouter.get("/:photoId", show);

//Create a new photo
photoRouter.post("/", store); // Regler, validering

//Update a photo
photoRouter.patch("/:photoId"); // Regler, validering, funktion

//Delete a photo
photoRouter.delete("/:photoId"); // Funktion
