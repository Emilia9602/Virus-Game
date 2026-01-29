import { prisma } from "../lib/prisma.ts";
import { CreatePhotoData, UpdatePhotoData } from "../types/Photo.types.ts";

//Get all photos

export const getPhotos = () => {
	return prisma.photo.findMany();
}

//Get a photo

/**
 * @param photoId ID of the photo to get
 */

export const getPhoto = (photoId: number) => {
	return prisma.photo.findUniqueOrThrow({
		where: {
			id: photoId,
		},
	})
}

//Create a new photo

/**
 * @param data Photo data
 */

export const createPhoto = async (data: CreatePhotoData) => {
	return prisma.photo.create({
		data,
	});
}

//Update a photo

/**
 * @param photoId ID of the photo to update
 * @param data Photo data
 * @returns
 */

export const updatePhoto = async (photoId: number, data: UpdatePhotoData) => {
	return prisma.photo.update({
		where: { id: photoId },
		data,
	});
}

//Delete a photo

/**
 * @param photoId ID of the photo to delete
 */

export const deletePhoto = async (photoId: number) => {
	return prisma.photo.delete({
		where: {
			id: photoId,
		}
	});
}
