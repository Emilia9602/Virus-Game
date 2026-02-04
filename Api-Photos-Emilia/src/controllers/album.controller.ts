import { Request, Response } from "express";
import { handlePrismaError } from "../lib/handlePrismaError.ts";
import { addPhotoToAlbum, createAlbum, deleteAlbum, getAlbum, getAlbums, removePhotoFromAlbum, updateAlbum } from "../services/album.service.ts";
import { PhotoId } from "../types/Photo.types.ts";
import { matchedData } from "express-validator";
import { CreateAlbumData, UpdateAlbumData } from "../types/Album.types.ts";

//Get all albums

export const index = async (_req: Request, res: Response) => {
	try {
		const albums = await getAlbums();
		res.status(200).send({ status: "success", data: albums });
		//Få rätt svar här sen
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

	try {
		const album = await getAlbum(albumId);
		res.status(200).send({
			status: "success", data: {
				id: album.id,
				title: album.title,
				//Ha med foton här
			}
		});
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Create a new album

export const store = async (req: Request, res: Response) => {

	const validatedData = matchedData<CreateAlbumData>(req);

	try {
		const album = await createAlbum(validatedData);
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
			status: "succes", data: {
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

export const addPhoto = async (req: Request<{ albumId: string }, unknown, PhotoId | PhotoId[] >, res: Response) => {

	const albumId = Number(req.params.albumId);

	if (!albumId) {
		res.status(400).send({ message: "Id Invalid"});
		return;
	}

	try {
		await addPhotoToAlbum(albumId, req.body);
		res.status(200).send({ status: "succes", data: null });
	} catch (err) {
		handlePrismaError(res, err);
	}
}

//Remove a photo from an album

export const removePhoto = async (req:Request, res: Response) => {
	const albumId = Number(req.params.albumId);
	const photoId = Number(req.params.photoId);

	if (!albumId || !photoId) {
		res.status(400).send({ message: "Id Invalid"});
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
		res.status(200).send({ status: "success", data: null});
	} catch (err) {
		handlePrismaError(res, err);
	}
}
