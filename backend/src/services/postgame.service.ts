import { prisma } from "../lib/prisma.ts";
import { Player } from "@shared/types/Models.types.ts";


/**
 * Create PostGame
 * @param finishPlayers Array of players with username and score
 * @returns {PostGame} Created PostGame
 */

export const createPostGame = async (finishPlayers: Player[] ) => {
    return await prisma.postGame.create({

  data: {
        player1UserName: finishPlayers[0].username,
        player1Score: finishPlayers[0].score,
        player2UserName: finishPlayers[1].username,
        player2Score: finishPlayers[1].score,
    },

    });
};

/**
 * Get 10 latest postGames
 * @returns {PostGame[]} Array of latest 10 postGames
 */

export const getTenLatestPostGames =  async() => {
return await prisma.postGame.findMany({
	 take: 10,
 orderBy: {
    id: "desc",
  },

});

};
