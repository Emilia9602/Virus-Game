import express from "express";
import { destroy, index, show, store, update } from "../controllers/photos.controller.ts";

export const photoRouter = express.Router();

//Get all photos
photoRouter.get("/", index);

//Get a single photo
photoRouter.get("/:photoId", show);

//Create a new photo
photoRouter.post("/", store); // Regler, validering

//Update a photo
photoRouter.patch("/:photoId", update); // Regler, validering

//Delete a photo
photoRouter.delete("/:photoId", destroy);
