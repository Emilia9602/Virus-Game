/**
 * Socket Controller
 */
import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import {
	createPlayer,
	deletePlayerInRoom,
	getPlayerInRoom,
	getPlayersInRoom,
	updatePlayerScores,
	updatePlayerTimer,
} from "../services/player.service.ts";
import { createRoom, getGameRooms, updateGameRoomRounds } from "../services/gameRoom.service.ts";
import { getVirusPositionAndTime } from "../helpers/virusPositionHelper.ts";
import { GameRoom } from "@shared/types/Models.types.ts";

const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
	debug("🙋 A user connected with id: %s", socket.id);

	// Spelare ansluter till kö
	/*



						//Emilias nya kod < - - - - -

						//Få tag i spelarna i vars en variabel
						const player1 = playersInRoom[0]; //Första spelaren
						const player2 = playersInRoom[1]; //Andra spelaren   Rätt sätt?

						//Kolla om spelarna har en reactionTime
						if (!player1.reactionTime || !player2.reactionTime) {
							debug("En eller båda av spelarna har ingen reaktionstid");
							return;
						}


						//Uppdatera spelarnas reactionTime
						await updatePlayerTimer(player1.id, player1.reactionTime);
						await updatePlayerTimer(player2.id, player2.reactionTime);

						//Uppdatera spelarnas poäng
						if (player1.reactionTime < player2.reactionTime) {
							//Om spelaren är snabbast =>
							await updatePlayerScores(player1.id);
						} else {
							await updatePlayerScores(player2.id);
						}

						//Uppdatera rundorna i gameRoom
						await updateGameRoomRounds(gameRoom.id);

						//Om det är spelrunda 10 -> gameOver
						if (gameRoom.gameRound === 10) {
							//Avsluta spelet
							gameRoom.gameOver = true;
						}

						//const gameStatus =      //Gameround, reactionTime, score

						//Skicka uppdaterad poängställnng och game status
						//io.to(gameRoom.id).emit("showUpdatedGameStatus", gameStatus);

						//Återställ timern för reactionTime
						await resetPlayerTimer(player1.id);
						await resetPlayerTimer(player2.id);

						//Om det gått 10 rundor, skicka resultatet
						if (gameRoom.gameOver === true) {
							const result = await createPostGame(playersInRoom);

							//Skicka resultatet
							io.to(gameRoom.id).emit("showResult", result);
						}

						//Slut på Emilias kod just nu < - - - - -




						//Skicka virusposition till nya rummet
						const { virus, setTimeOutTimer } = getVirusPositionAndTime();
						io.to(newGameRoom.id).emit("virusPositionsAndTime", virus, setTimeOutTimer);
						return;
					}
					count--;
				}, 1000);
			} else {
				io.to(gameRoom.id).emit("waiting");
			}
		} catch (err) {
			debug("Error in playerJoinRequest:", err);
			console.error("Error:", err);
		}
	}); */

	// Spelare ansluter till kö
	socket.on("playerJoinRequest", async (username, callback) => {
		// 1. Hitta ledigt rum eller skapa nytt
		const rooms: GameRoom[] = await getGameRooms();

		// 2. Hitta spelrum med en Player
		let gameRoom = rooms.find((room) => room.players?.length === 1);

		// 3.Om ej ledigt rum finns - skapa ett nytt
		if (!gameRoom) {
			gameRoom = await createRoom();
			console.log(`Skapade nytt rum med id: ${gameRoom.id}`);
		} else {
			console.log(`Hittade ledigt rum med id: ${gameRoom.id}`);
		}

		// 4. Joina (socket.io) game-rummet
		socket.join(gameRoom.id);
		console.log(`Spelare "${username}" anslöt till rum: ${gameRoom.id}`);

		// 5. Skapa spelare/användare
		await createPlayer({
			id: socket.id,
			socketId: socket.id,
			username,
			gameRoomId: gameRoom.id,
			score: 0,
			reactionTime: 0, // Prisma-genererat fält
		});

		// 6. Skicka svar till klienten
		callback({
			success: true,
			gameRoomId: gameRoom.id,
		});

		// 7. Hämta alla spelare i rummet
		const playersInRoom = await getPlayersInRoom(gameRoom.id);

		// 8. Om rummet är fullt (2 spelare), starta spelet annars vänta
		if (playersInRoom.length === 2) {
			io.to(gameRoom.id).emit("startGame"); // skicka t frontend
			io.to(gameRoom.id).emit("playersInRoom", playersInRoom);

			// get virus position and time
			const { virus, setTimeOutTimer } = getVirusPositionAndTime();
			io.to(gameRoom.id).emit("virusPositionsAndTime", virus, setTimeOutTimer);
		} else {
			io.to(gameRoom.id).emit("waiting");
		}
	});

	socket.on("virusClicked", async (_reactionTime) => {
		const player = await getPlayerInRoom(socket.id);
		if (!player || !player.gameRoomId) return;

		const { virus, setTimeOutTimer } = getVirusPositionAndTime();
		io.to(player.gameRoomId).emit("virusPositionsAndTime", virus, setTimeOutTimer);
	});

	// Hantera disconnect
	socket.on("disconnect", async () => {
		debug("👋 A user disconnected with id: %s", socket.id);

		//Hämta spelaren
		const player = await getPlayerInRoom(socket.id);

		//Kolla om spelaren finns
		if (!player) {
			return;
		}

		//Ta bort spelare med socket.id
		await deletePlayerInRoom(socket.id);

		// om en spelare disconnectar/ragequitta informera andra spelaren i rummet

		if (player.gameRoomId) {
			io.to(player.gameRoomId).emit("playerRageQuit", player.username, player.gameRoomId);
		}
	});
};

