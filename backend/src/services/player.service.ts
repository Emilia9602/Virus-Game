import { Player } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";

//Create player
/**
 *
 * @param data Player data
 * @returns {Player} Player
 */

//Skapa spelare
export const createPlayer = (data: Player) => {
	return prisma.player.upsert({
		where: { id: data.id },
		create: data,
		update: { gameRoomId: data.gameRoomId, username: data.username },
	});
};

//Get all players in the room
/**
 *
 * @param gameRoomId  ID of the room
 * @returns Players in the room
 */

//Hämta alla spelare i rummet
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

//Hämta spelare via socketId
export const getPlayerInRoom = (playerId: string) => {
	return prisma.player.findUnique({
		where: { id: playerId },
	});
};

//Update  Player's reaktionstid
/**
 *
 * @param playerId  ID of the player
 * @returns Player in the room
 */

//Uppdatera spelarens reaktionstid
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

//Nollställ spelarnas reaktionstider
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

//Uppdatera spelaren som ska få poäng
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

//Nollställ spelarens poäng från förra spelet
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

//Radera spelare och disconnecta från rum
export const deletePlayerInRoom = (playerId: string) => {
	return prisma.player.delete({
		where: { id: playerId },
	});
};

/**
Delete all players and games
*/

//Radera alla spelare och spel
export const deleteAllPlayersAndGames = async () => {
	await prisma.player.deleteMany();
	await prisma.gameRoom.deleteMany();
};
