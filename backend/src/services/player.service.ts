import { Player } from "@shared/types/Models.types.ts"
import { prisma } from "../lib/prisma.ts"

//Create player
/**
 *
 * @param data Player data
 * @returns {Player} Player
 */

export const createPlayer = async (data: Player) => {
	return await prisma.player.create({
		data,
	})
}

//Get players in the room
/**
 *
 * @param roomId ID of the room
 * @returns Players in the room
 */

export const getPlayersInRoom = async (roomId: string) => {
	return await prisma.player.findMany({
		where: { roomId },
	});
}
