import { prisma } from "../lib/prisma.ts";
import { PostGame } from "@shared/types/Models.types.ts";

//Create PostGame
/**
 *
 * @param gameRoomId ID of the users gameRoom
 * @returns {PostGame} PostGame
 */

export const createPostGame = (data: PostGame) => {
	return prisma.postGame.upsert({
		where: {
			id: data.id
		},

	create: data,
	update: {
		player1UserName: data.player1UserName,
		player1Score: data.player1Score,
		player2UserName: data.player2UserName,
		player2Score: data.player2Score,
	},

	});
}

//Get postGames by player
/**
 *
 * @param playerId ID of the player to get their PostGame
 * @returns PostGame of specific player
 */

export const getPostGamesByPlayer = (playerId: string) => {
	return prisma.postGame.findUnique({
		where: {
			id: playerId,
		}
	});
}

//Get postGame id
/**
 *
 * @param postGameId ID of the postGame to get
 */

export const getPostGameById = (postGameId: string) => {
	return prisma.postGame.findUnique({
		where: {
			id: postGameId,
		},
	});
}

//Get all postGames
/**
 *
 * @returns All postGames in a list
 */

export const getAllPostGames = () => {
	return prisma.postGame.findMany();
}

//Update 10 latest postGames, delete older than 10, update with new

export const updateTenLatestPostGames = (data: ) => { //Array of GameRoom[]
//Uppdatera och ta bort
//Visa namn och poäng
}

//Get winner, om winner=false - loser
//Använda getPostGameById till att kolla vinnaren?

/*export const getWinner = () => {

}*/
