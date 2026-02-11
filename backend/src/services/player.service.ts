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
		gameRoomId: data.gameRoomId
	},

	});
}

//Get players in the room
/**
 *
 * @param gameRoomId  ID of the room
 * @returns Players in the room
 */

export const getPlayersInRoom = async(gameRoomId : string) => {
	return await prisma.player.findMany({
		where: { gameRoomId: gameRoomId  },
	});
}


//Get player in the room
/**
 *
 * @param gameRoomId  ID of the room
 * @returns Player in the room
 */

//export const getPlayerInRoom = async(gameRoomId : string) => {}
