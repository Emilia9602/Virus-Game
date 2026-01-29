import { prisma } from "../lib/prisma.ts"
import { CreateAlbumData } from "../types/Album.types.ts";

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
