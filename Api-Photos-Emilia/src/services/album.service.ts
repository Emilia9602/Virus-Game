import { prisma } from "../lib/prisma.ts"
import { CreateAlbumData, UpdateAlbumData } from "../types/Album.types.ts";
import { PhotoId } from "../types/Photo.types.ts";

//Get all albums

/**
 *
 * @param userId ID of the user to get their albums
 * @returns
 */
export const getAlbums = (userId: number) => {
	return prisma.album.findMany({
		where: {
			userId: userId,
		},
	});
}

//Get a single album

/**
 * @param albumId ID of the albuum to get
 * @param userId ID of the user to get their album
 */

export const getAlbum = (albumId: number, userId: number) => {
	return prisma.album.findUniqueOrThrow({
		where: {
			id: albumId,
			userId: userId,
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
 * @param userId ID of the user to add photo(s) to their album
 */

export const addPhotoToAlbum = async (albumId: number, userId: number, photoIdOrIds: PhotoId | PhotoId[]) => {
	return prisma.album.update({
		where: {
			id: albumId,
			userId: userId,
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
