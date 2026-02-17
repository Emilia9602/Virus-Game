import { prisma } from "../lib/prisma.ts";

//Create player
/**
 *
 * @param data Player data
 * @returns {Player} Player
 */

//Skapa spelare
export const createPlayer = async (data: {
	username: string;
	gameRoomId: string;
	score: number;
	reactionTime: number;
	socketId: string;
}) => {
	return await prisma.player.create({
		data,
	});
};

//Get all players in the room
/**
 *
 * @param gameRoomId  ID of the room
 * @returns Players in the room
 */

//Hämta spelare via socketId
export const getPlayerInRoom = (socketId: string) => {
	return prisma.player.findFirst({
		where: { socketId },
	});
};

export const getPlayersInRoom = async (gameRoomId: string) => {
	return await prisma.player.findMany({
		where: { gameRoomId: gameRoomId },
	});
};

//Get a single player in the room
/**
 *
 * @param playerId  ID of the player
 * @returns Player in the room
 */


//Update  Player's reaktionstid
/**
 *
 * @param playerId  ID of the player
 * @returns Player in the room
 */

export const updatePlayerTimer = async (playerId: string, reactionTime: number) => {
	return await prisma.player.update({
		where: { id: playerId },
		data: { reactionTime },
	});
};

//Reset Player's reaktionstid
/**
 *
 * @param playerId  ID of the player
 * @returns Player in the room
 * Starta en ny runda o nollstall reaktiontiden
 */

export const resetPlayerTimer = async (gameRoomId: string) => {
	return await prisma.player.updateMany({
		where: { gameRoomId },
		data: { reactionTime: 0 },
	});
};

// Update Player's game scores
/**
 *
 * @param playerId  ID of the player
 * @returns
 */

export const updatePlayerScores = async (playerId: string) => {
	return await prisma.player.update({
		where: { id: playerId },
		data: {
			score: {
				increment: 1,
			},
		},
	});
};

//Reset Player's game scores
/**
 *
 * @param playerId  ID of the player
 * @returns Player in the room
 */

export const resetPlayerScores = async (playerId: string) => {
	return await prisma.player.update({
		where: { id: playerId },
		data: { score: 0 },
	});
};

//Delete player in the room // Disconnect Player from GameRoom
/**
 *
 * @param playerId  ID of the player
 * @returns Player in the room
 */
export const deletePlayerInRoom = (playerId: string) => {
	prisma.player.delete({
		where: { id: playerId },
	});
};
