import { Request, Response } from "express";
import { handlePrismaError } from "../lib/handlePrismaError.ts";
import { createPhoto, deletePhoto, getPhoto, getPhotos, updatePhoto } from "../services/photo.service.ts";

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

//Get a single photo

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

//Create a new photo

export const store = async (req: Request, res: Response) => {

	//Hämta validerad data

	try {
		const photo = await createPhoto(); //Validerad data här
		res.status(201).send({ status: "success", data: {
			title: photo.title,
			url: photo.url,
			comment: photo.comment,
			user_id: //Den som skapa fotot
			id: photo.id,
		}});
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

	//Få validerad data här

	try {
		const photo = await updatePhoto(photoId, ); //Validerad data
		res.status(200).send({ status: "success", data: {
			title: photo.title,
			url: photo.url,
			comment: photo.comment,
			user_id: //user id?
			id: photo.id,
		}});
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

	try {  //Kolla så den raderar länkarna till albumen, men inte själva albumen
		await deletePhoto(photoId);
		res.status(200).send({ status: "success", data: null});
	} catch (err) {
		handlePrismaError(res, err);
	}
}
