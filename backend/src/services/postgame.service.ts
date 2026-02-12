import { prisma } from "../lib/prisma.ts";
import { Player, PostGame } from "@shared/types/Models.types.ts";

//Create PostGame
/**
 *
 * @param gameRoomId ID of the users gameRoom
 * @returns {PostGame} PostGame
 */

//Fick inte riktigt rätt på detta än
/*
export const createPostGame = (finishPlayers: Player[]) => {
	return prisma.postGame.create();
}
	*/

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
