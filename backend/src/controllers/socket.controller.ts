/**
 * Socket Controller
 */
import { GameRoom } from "@shared/types/Models.types.ts";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { getVirusPositionAndTime } from "../helpers/virusPositionHelper.ts";
import { createRoom, getGameRooms } from "../services/gameRoom.service.ts";
import {
	createPlayer,
	deletePlayerInRoom,
	getPlayerInRoom,
	getPlayersInRoom,
	updatePlayerScores,
	updatePlayerTimer,
} from "../services/player.service.ts";

const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
	debug("🙋 A user connected with id: %s", socket.id);

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

	socket.on("virusClicked", async (reactionTime: number, gameRoomId: string) => {
		// find player
		const player = await getPlayerInRoom(socket.id);
		//Kolla om spelaren finns
		if (!player) {
			return;
		}

		// Uppdatera tid och poäng med dina befintliga funktioner
		await updatePlayerTimer(socket.id, reactionTime);
		await updatePlayerScores(socket.id);



		// Skicka ut uppdateringen till rummet
		io.to(gameRoomId).emit("showUpdatedGameStatus", {
			gameRound: 0,
			reactionTime: reactionTime,
			score: player.score + 1,
		});



		// update both players reaction time and send to frontend

			const updatedPlayer = await getPlayersInRoom(gameRoomId);
			const [player1, player2] = updatedPlayer;

			io.to(player1.id).emit("stopTimer", player1.id === socket.id)
			io.to(player2.id).emit("stopTimer", player2.id === socket.id)

		// logik if both players have clicked on virus add point to fastes player


		const { virus, setTimeOutTimer } = getVirusPositionAndTime();
		io.to(gameRoomId).emit("virusPositionsAndTime", virus, setTimeOutTimer);






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
