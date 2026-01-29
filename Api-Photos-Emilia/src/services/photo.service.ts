import { prisma } from "../lib/prisma.ts";

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
