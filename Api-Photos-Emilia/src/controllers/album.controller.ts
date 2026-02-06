import { Request, Response } from "express";
import { handlePrismaError } from "../lib/handlePrismaError.ts";
import { addPhotoToAlbum, createAlbum, deleteAlbum, getAlbum, getAlbums, removePhotoFromAlbum, updateAlbum } from "../services/album.service.ts";
import { PhotoId } from "../types/Photo.types.ts";
import { matchedData } from "express-validator";
import { CreateAlbumData, UpdateAlbumData } from "../types/Album.types.ts";
import { getPhotoUserIds } from "../services/photo.service.ts";

//Get all albums

export const index = async (req: Request, res: Response) => {
	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const userId = Number(req.token.sub);

	if (!userId) {
		res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
		return;
	}

	try {
		const albums = await getAlbums(userId);
		res.status(200).send({ status: "success", data: albums });
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Get a single album

export const show = async (req: Request, res: Response) => {

	const albumId = Number(req.params.albumId);

	if (!albumId) {
		res.status(400).send({ message: "Invalid Id" });
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
		const album = await getAlbum(albumId, userId);
		res.status(200).send({
			status: "success", data: {
				id: album.id,
				title: album.title,
				photos: album.photos,
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Create a new album

export const store = async (req: Request, res: Response) => {

	if (!req.token) {
		throw new Error("Authenticated user does not exist");
	}

	const validatedData = matchedData<CreateAlbumData>(req);
	const userId = Number(req.token.sub);

	try {
		const album = await createAlbum(validatedData, userId);

		res.status(200).send({
			status: "success", data: {
				title: album.title,
				userId: album.userId,
				id: album.id
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Update an album

export const update = async (req: Request, res: Response) => {

	const albumId = Number(req.params.albumId);

	if (!albumId) {
		res.status(400).send({ message: "Invalid Id" });
		return;
	}

	const validatedData = matchedData<UpdateAlbumData>(req);

	try {
		const album = await updateAlbum(albumId, validatedData);
		res.status(200).send({
			status: "success", data: {
				title: album.title,
				user_id: album.userId,
				id: album.id,
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Add a photo or photos to an album

export const addPhoto = async (req: Request<{ albumId: string }, unknown, PhotoId | PhotoId[]>, res: Response) => {

	const albumId = Number(req.params.albumId);

	if (!albumId) {
		res.status(400).send({ message: "Id Invalid" });
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

	const photoUserIds = await getPhotoUserIds(userId);

	photoUserIds.map((photo) => {
		if (photo.userId !== userId) {
			res.status(403).send({ status: "fail", data: { message: "Access forbidden" } });
			return;
		}
	});

	try {
		await addPhotoToAlbum(albumId, userId, req.body);
		res.status(200).send({ status: "success", data: null });
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Remove a photo from an album

export const removePhoto = async (req: Request, res: Response) => {
	const albumId = Number(req.params.albumId);
	const photoId = Number(req.params.photoId);

	if (!albumId || !photoId) {
		res.status(400).send({ message: "Id Invalid" });
		return;
	}

	try {
		await removePhotoFromAlbum(albumId, photoId);
		res.status(200).send({ status: "success", data: null });
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Delete an album

export const destroy = async (req: Request, res: Response) => {

	const albumId = Number(req.params.albumId);

	if (!albumId) {
		res.status(400).send({ message: "Invalid Id" });
		return;
	}

	try {
		await deleteAlbum(albumId);
		res.status(200).send({ status: "success", data: null });
	} catch (err) {
		handlePrismaError(res, err);
	}
}
