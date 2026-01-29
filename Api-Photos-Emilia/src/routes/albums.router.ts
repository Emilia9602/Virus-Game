import express from "express";
import { destroy, index, show, store, update } from "../controllers/album.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";

export const albumRouter = express.Router();

//Get all albums
albumRouter.get("/", index);

//Get a single album
albumRouter.get("/:albumId", show);

//Create a new album
albumRouter.post("/", validateRequest, store); // Regler

//Update an album
albumRouter.patch("/:albumId", validateRequest, update); // Regler

//Add a photo to an album
albumRouter.post("/:albumId/photos"); // Funktion

//Add multiple photos to an album
// SAMMA som ovan med ett foto? Lägg in som en array ist för objekt?

//Remove a photo from an album
albumRouter.delete("/:albumId/photos/:photoId"); // Funktion

//Delete an album
albumRouter.delete("/:albumId", destroy);
