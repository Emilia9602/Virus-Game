import { Request, Response } from "express";
import { handlePrismaError } from "../lib/handlePrismaError.ts";
import { createPhoto, deletePhoto, getPhoto, getPhotos, getPhotoUserId, updatePhoto } from "../services/photo.service.ts";
import { matchedData } from "express-validator";
import { CreatePhotoData, UpdatePhotoData } from "../types/Photo.types.ts";

// Get all photos

export const index = async (req: Request, res: Response) => {
	try {

		if (!req.token) {
			throw new Error("Authenticated user does not exist");
		}

		const userId = Number(req.token.sub);

		if (!userId) {
			res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
			return;
		}

		const photos = await getPhotos(userId);

		res.status(200).send({ status: "success", data: photos })
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Get a single photo

export const show = async (req: Request, res: Response) => {

	const photoId = Number(req.params.photoId);

	if (!photoId) {
		res.status(400).send({ message: "Invalid id" });
		return;
	}

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const userId = Number(req.token.sub);

	if (!userId) {
		res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
		return;
	}

	try {
		const photo = await getPhoto(photoId, userId);
		res.status(200).send({
			status: "success", data: {
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

//Create a new photo

export const store = async (req: Request, res: Response) => {

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const validatedData = matchedData<CreatePhotoData>(req);
	const userId = Number(req.token.sub);

	if (!userId) {
		res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
		return;
	}

	try {
		const photo = await createPhoto(validatedData, userId);
		res.status(201).send({
			status: "success", data: {
				title: photo.title,
				url: photo.url,
				comment: photo.comment,
				user_id: photo.userId,
				id: photo.id
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Update a photo

export const update = async (req: Request, res: Response) => {

	const photoId = Number(req.params.photoId);

	if (!photoId) {
		res.status(400).send({ message: "Invalid id" });
		return;
	}

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const userId = Number(req.token.sub);

	if (!userId) {
		res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
		return;
	}

	const photoUserId = await getPhotoUserId(photoId);

	photoUserId.map((photo) => {
		if (photo.userId !== userId) {
			res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
			return;
		}
	});

	const validatedData = matchedData<UpdatePhotoData>(req);

	try {
		const photo = await updatePhoto(photoId, userId, validatedData);

		res.status(200).send({
			status: "success", data: {
				title: photo.title,
				url: photo.url,
				comment: photo.comment,
				user_id: photo.userId,
				id: photo.id
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Delete a photo

export const destroy = async (req: Request, res: Response) => {

	const photoId = Number(req.params.photoId);

	if (!photoId) {
		res.status(400).send({ message: "Invalid id" });
		return;
	}

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const userId = Number(req.token.sub);

	if (!userId) {
		res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
		return;
	}

	const photos = await getPhotos(userId)

	if (!photos) {
		res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
		return;
	}

	try {
		await deletePhoto(photoId, userId);
		res.status(200).send({ status: "success", data: null });
	} catch (err) {
		handlePrismaError(res, err);
	}
}
