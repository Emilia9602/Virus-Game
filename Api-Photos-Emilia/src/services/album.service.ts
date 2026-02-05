import { prisma } from "../lib/prisma.ts"
import { CreateAlbumData, UpdateAlbumData } from "../types/Album.types.ts";
import { PhotoId } from "../types/Photo.types.ts";

//Get all albums

export const getAlbums = () => {
	return prisma.album.findMany();
}

//Get a single album

/**
 * @param albumId ID of the albuum to get
 */

export const getAlbum = (albumId: number) => {
	return prisma.album.findUniqueOrThrow({
		where: {
			id: albumId,
		},
		include: {
			photos: true,
		},
	});
}

//Create a new album

export const createAlbum = async (data: CreateAlbumData, userId: number) => {
	return prisma.album.create({
		data: {
			title: data.title,
			userId: userId,
		}
	});
}

//Update an album

/**
 * @param albumid ID of the album to update
 * @param data Album data
 * @returns
 */

export const updateAlbum = async (albumId: number, data: UpdateAlbumData) => {
	return prisma.album.update({
		where: { id: albumId },
		data,
	});
}

//Add a photo or photos to an album

/**
 * @param albumId ID of the album to add a photo to
 * @param photoIdOrIds ID(s) of the photo or photos to add
 */

export const addPhotoToAlbum = async (albumId: number, photoIdOrIds: PhotoId | PhotoId[]) => {
	return prisma.album.update({
		where: {
			id: albumId,
		},
		data: {
			photos: {
				connect: photoIdOrIds,
			},
		},
	});
}

//Remove a photo from an album

/**
 * @param albumId ID of the album to remove a photo from
 * @param photoId ID of the photo to remove
 * @returns
 */

export const removePhotoFromAlbum = async (albumId: number, photoId: number) => {
	return prisma.album.update({
		where: {
			id: albumId,
		},
		data: {
			photos: {
				disconnect: {
					id: photoId,
				},
			},
		},
	});
}

//Delete an album

/**
 * @param albumId ID of the album to delete
 */

export const deleteAlbum = async (albumId: number) => {
	return prisma.album.delete({
		where: {
			id: albumId,
		}
	});
}
