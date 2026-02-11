import { prisma } from "../lib/prisma.ts";

//Create room

export const createRoom = async () => {
	return await prisma.room.create({});
}
