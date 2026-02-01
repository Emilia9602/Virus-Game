import express from "express";
import { addPhoto, destroy, index, removePhoto, show, store, update } from "../controllers/album.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";
import { createAlbumRules, updateAlbumRules } from "../rules/album.rules.ts";

export const albumRouter = express.Router();

//Get all albums
albumRouter.get("/", index);

//Get a single album
albumRouter.get("/:albumId", show);

//Create a new album
albumRouter.post("/", createAlbumRules, validateRequest, store);

//Update an album
albumRouter.patch("/:albumId", updateAlbumRules, validateRequest, update);

//Add a photo to an album
albumRouter.post("/:albumId/photos", addPhoto);

//Add multiple photos to an album
// SAMMA som ovan med ett foto? Lägg in som en array ist för objekt?

//Remove a photo from an album
albumRouter.delete("/:albumId/photos/:photoId", removePhoto);

//Delete an album
albumRouter.delete("/:albumId", destroy);
