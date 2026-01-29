import express from "express";
import { destroy, index, show, store, update } from "../controllers/photos.controller.ts";
import { validateRequest } from "../middlewares/validateRequest.ts";

export const photoRouter = express.Router();

//Get all photos
photoRouter.get("/", index);

//Get a single photo
photoRouter.get("/:photoId", show);

//Create a new photo
photoRouter.post("/", validateRequest, store); // Regler

//Update a photo
photoRouter.patch("/:photoId", validateRequest, update); // Regler

//Delete a photo
photoRouter.delete("/:photoId", destroy);
