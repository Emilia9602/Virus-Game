import { prisma } from "../lib/prisma.ts"
import { CreateAlbumData, UpdateAlbumData } from "../types/Album.types.ts";

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
	});
}

//Create a new album

export const createAlbum = async (data: CreateAlbumData) => {
	return prisma.album.create({
		data,
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
