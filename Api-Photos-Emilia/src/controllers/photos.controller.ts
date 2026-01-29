import { Request, Response } from "express";
import { handlePrismaError } from "../lib/handlePrismaError.ts";
import { getPhoto, getPhotos } from "../services/photo.service.ts";

// Get all photos

export const index = async (_req: Request, res: Response) => {
	try {
		const photos = await getPhotos();
		res.status(200).send({ status: "success", data: photos })
		//userId ska inte va med, fixa!
	} catch (err) {
		handlePrismaError(res, err);
	}
}

export const show = async (req: Request, res: Response) => {

	const photoId = Number(req.params.photoId);

	if (!photoId) {
		res.status(400).send({ message: "Invalid id" });
		return;
	}

	try {
		const photo = await getPhoto(photoId);
		res.status(200).send({
			status: "succes", data: {
				id: photo.id,
				title: photo.title,
				url: photo.url,
				comment: photo.comment,
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}
