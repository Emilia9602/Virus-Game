import express from "express";

export const photoRouter = express.Router();

//Get all photos
photoRouter.get("/"); // Funktion

//Get a single photo
photoRouter.get("/:photoId"); // Funktion

//Create a new photo
photoRouter.post("/"); // Regler, validering, funktion

//Update a photo
photoRouter.patch("/:photoId"); // Regler, validering, funktion

//Delete a photo
photoRouter.delete("/:photoId"); // Funktion
