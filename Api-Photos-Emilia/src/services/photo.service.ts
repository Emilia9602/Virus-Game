import { prisma } from "../lib/prisma.ts";
import { CreatePhotoData, UpdatePhotoData } from "../types/Photo.types.ts";

//Get all photos

/**
 * @param userId ID of the user to get user's photos
 * @returns
 */

export const getPhotos = (userId: number) => {
	return prisma.photo.findMany({
		where: { userId: userId },
		select: {
			id: true,
			title: true,
			url: true,
			comment: true,
		}
	});
}

//Get a photo

/**
 * @param photoId ID of the photo to get
 * @param userId ID of the user to get their photo
 */

export const getPhoto = (photoId: number, userId: number) => {
	return prisma.photo.findUniqueOrThrow({
		where: {
			id: photoId,
			userId: userId
		},
	})
}

//Create a new photo

/**
 * @param data Photo data
 */

export const createPhoto = async (data: CreatePhotoData, userId: number) => {
	return prisma.photo.create({
		data: {
			title: data.title,
			url: data.url,
			comment: data.comment,
			userId: userId,
		}
	});
}

//Update a photo

/**
 * @param photoId ID of the photo to update
 * @param userId ID of the user to update their photo
 * @param data Photo data
 * @returns
 */

export const updatePhoto = async (photoId: number, userId: number, data: UpdatePhotoData) => {
	return prisma.photo.update({
		where: {
			id: photoId,
			userId: userId,
		},
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
