import { Player } from "@shared/types/Models.types.ts"
import { prisma } from "../lib/prisma.ts"


//Create player
/**
 *
 * @param data Player data
 * @returns {Player} Player
 */

export const createPlayer = (data: Player) => {
	return prisma.player.upsert({
		where: {
			id: data.id
		},

	create: data,
	update: {
		username: data.username,
		gameoomId: data.roomId
	}

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
