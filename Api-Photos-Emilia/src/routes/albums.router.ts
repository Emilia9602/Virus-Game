import express from "express";

export const albumRouter = express.Router();

//Get all albums
albumRouter.get("/"); // Funktion

//Get a single album
albumRouter.get("/:albumId"); // Funktion

//Create a new album
albumRouter.post("/"); // Regler, validering, funktion

//Update an album
albumRouter.patch("/:albumId"); // Regler, validering, funktion

//Add a photo to an album
albumRouter.post("/:albumId/photos"); // Funktion

//Add multiple photos to an album
// SAMMA som ovan med ett foto? Lägg in som en array ist för objekt?

//Remove a photo from an album
albumRouter.delete("/:albumId/photos/:photoId"); // Funktion

//Delete an album
albumRouter.delete("/:albumId"); // Funktion
