import { GameRoom } from "@shared/types/Models.types.ts";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { getVirusPositionAndTime } from "../helpers/virusPositionHelper.ts";
import {
    createRoom,
    getGameRoom,
    getGameRooms,
    getLiveScores,
    updateGameRoomRounds,
    deleteGameRoom, // Importera raderingsfunktionen
} from "../services/gameRoom.service.ts";
import {
    createPlayer,
    deletePlayerInRoom,
    getPlayerInRoom,
    getPlayersInRoom,
    resetPlayerScores,
    resetPlayerTimer,
    updatePlayerScores,
    updatePlayerTimer,
} from "../services/player.service.ts";

const debug = Debug("backend:socket_controller");

export const handleConnection = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
    debug("🙋 A user connected with id: %s", socket.id);

    // Hjälpfunktion för att uppdatera alla klienter om pågående matcher
    const broadcastLiveScores = async () => {
        const ongoingGames = await getLiveScores();
        io.emit("showLiveScore", ongoingGames || []);
    };

    socket.on("playerJoinRequest", async (username, callback) => {
        const rooms: GameRoom[] = await getGameRooms();
        let gameRoom = rooms.find((room) => room.players?.length === 1);

        if (!gameRoom) {
            gameRoom = await createRoom();
        }

        socket.join(gameRoom.id);

        await createPlayer({
            id: socket.id,
            socketId: socket.id,
            username,
            gameRoomId: gameRoom.id,
            score: 0,
            reactionTime: null,
        });

        // Uppdatera listan för alla så fort en spelare går in i ett rum
        await broadcastLiveScores();

        callback({ success: true, gameRoomId: gameRoom.id });

        const playersInRoom = await getPlayersInRoom(gameRoom.id);

        if (playersInRoom.length === 2) {
            io.to(gameRoom.id).emit("startGame");
            io.to(gameRoom.id).emit("playersInRoom", playersInRoom);

            const { virus, setTimeOutTimer } = getVirusPositionAndTime();
            io.to(gameRoom.id).emit("virusPositionsAndTime", virus, setTimeOutTimer);
        } else {
            io.to(gameRoom.id).emit("waiting");
        }
    });

    socket.on("virusClicked", async (reactionTime: number, gameRoomId: string) => {
        const player = await getPlayerInRoom(socket.id);
        if (!player) return;

        await updatePlayerTimer(socket.id, reactionTime);
        socket.to(gameRoomId).emit("stopTimer", socket.id);

        const players = await getPlayersInRoom(gameRoomId);
        if (players.length < 2) return;

		const [player1, player2] = players;

		io.to(gameRoomId). emit("stopTimer", socket.id);

		// ONLY execute scoring if BOTH have reaction times
		if (player1.reactionTime && player2.reactionTime) {
			console.log(`--- Round Calculation Start ---`);
			console.log(`P1 (${player1.username}): ${player1.reactionTime}ms`);
			console.log(`P2 (${player2.username}): ${player2.reactionTime}ms`);

			// 1. Uppdatera poäng i DB för vinnaren
			if (player1.reactionTime < player2.reactionTime) {
				await updatePlayerScores(player1.id);
				console.log(`Vinnare: ${player1.username}`);
			} else if (player2.reactionTime < player1.reactionTime) {
				await updatePlayerScores(player2.id);
				console.log(`Vinnare: ${player2.username}`);
			}

			// 2. Hämta de absolut senaste spelarna för att se att poängen faktiskt sparats
			const updatedPlayers = await getPlayersInRoom(gameRoomId);

			// Debug-logg för att bekräfta DB-status
			if (updatedPlayers.length >= 2) {
				console.log(
					`[DB SYNC] Score i DB just nu -> ${updatedPlayers[0].username}: ${updatedPlayers[0].score}, ${updatedPlayers[1].username}: ${updatedPlayers[1].score}`,
				);

				// 3. Skicka de uppdaterade poängen till frontend
				// Vi använder värdena direkt från 'updatedPlayers' (DB) istället för de gamla objekten
				const p1 = updatedPlayers[0];
				const p2 = updatedPlayers[1];
				io.to(gameRoomId).emit(
					"showScores",
					p1.score,
					p2.score,
				);
			}

			// Uppdatera runda
			await updateGameRoomRounds(gameRoomId);
			const gameRoom = await getGameRoom(gameRoomId);

            // Hantera Game Over och radera rummet
            if (gameRoom && gameRoom.gameRound !== null && gameRoom.gameRound >= 10) {
                io.to(gameRoomId).emit("currentGameResult", updatedPlayers[0], updatedPlayers[1]);

                // Vänta 2 sekunder innan radering så att sista poängen hinner visas ordentligt
                setTimeout(async () => {
                    await deleteGameRoom(gameRoomId);
                    await broadcastLiveScores(); // Uppdatera listan på förstasidan
                    debug("Match completed and room %s deleted", gameRoomId);
                }, 2000);
                return;
            }

            // Uppdatera live-listan (visar aktuell runda i din frontend)
            await broadcastLiveScores();

            await resetPlayerTimer(gameRoomId);
            const { virus, setTimeOutTimer } = getVirusPositionAndTime();
            io.to(gameRoomId).emit("virusPositionsAndTime", virus, setTimeOutTimer);
        }
    });

    socket.on("disconnect", async () => {
        const player = await getPlayerInRoom(socket.id);
        if (!player) return;

		await resetPlayerScores(player.id);

        const gameRoomId = player.gameRoomId;
        await deletePlayerInRoom(player.id);

        if (gameRoomId) {
            const remainingPlayers = await getPlayersInRoom(gameRoomId);

            if (remainingPlayers.length === 0) {
                // Rummet är tomt, radera direkt
                await deleteGameRoom(gameRoomId);
                await broadcastLiveScores();
            } else {
                // Informera motståndaren
                io.to(gameRoomId).emit("playerRageQuit", player.username, gameRoomId);

                // Radera rummet efter en kort stund så motståndaren hinner se rage-quit meddelandet
                await deleteGameRoom(gameRoomId);
                await broadcastLiveScores();
            }
        }

        await broadcastLiveScores();
        debug("👋 User %s disconnected and cleanup triggered", socket.id);
    });
};

