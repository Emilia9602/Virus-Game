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
import {
	createRoom,
	getGameRoom,
	getGameRooms,
	updateGameRoomRounds,
} from "../services/gameRoom.service.ts";
import {
	createPlayer,
	deletePlayerInRoom,
	getPlayerInRoom,
	getPlayersInRoom,
	resetPlayerTimer,
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

	// Hantera virus-klick
	// Hantera virus-klick
	socket.on("virusClicked", async (reactionTime: number, gameRoomId: string) => {
		// 1. get player som klickade
		const player = await getPlayerInRoom(socket.id);
		if (!player) return;

		// 2. save reakation time in db for this player
		await updatePlayerTimer(socket.id, reactionTime);

		// 2.1 Send reactionTime to opponent
		socket.to(gameRoomId).emit("showOpponentTimer", reactionTime);

		// 3. get both players in the room an compare the reaction times
		const players = await getPlayersInRoom(gameRoomId);
		if (players.length < 2) return;

		// 4. update both players reaction time and send to frontend
		const [player1, player2] = players;

		io.to(player1.id).emit("stopTimer", player1.id === socket.id);
		io.to(player2.id).emit("stopTimer", player2.id === socket.id);

		// 5. check if both players have klickat
		if (player1.reactionTime && player2.reactionTime) {
			// 6. Jämför vem som var snabbast och uppdatera poäng
			if (player1.reactionTime < player2.reactionTime) {
				await updatePlayerScores(player1.id);
			} else if (player2.reactionTime < player1.reactionTime) {
				await updatePlayerScores(player2.id);
			} else {
				console.log("Båda reagera lika snabbt");
			}

			// 6.1 Uppdatera poängen och skicka till frontend
			const updatedPlayerScores = await getPlayersInRoom(gameRoomId);
			const [p1, p2] = updatedPlayerScores;
			io.to(gameRoomId).emit("showScores", p1.score, p2.score);

			// 7. Nollställ reaktionstiderna i db inför nästa runda
			await resetPlayerTimer(gameRoomId);

			// Uppdatera rundorna i gameRoom
			await updateGameRoomRounds(gameRoomId);

			const gameRoom = await getGameRoom(gameRoomId);
			if (!gameRoom) {
				debug("Hittade inget spelrum");
				return;
			}

			// Om det är spelrunda 10 -> Avbryt och skicka inget nytt virus
			if (gameRoom.gameRound !== null && gameRoom.gameRound >= 10) {
				console.log("Game Over - runda 10 nådd");
				return; // Här stannar vi!
			}

			/**
			 * FRYSTID / PAUS
			 * Väntar 3 sekunder (3000ms) innan nästa virus skickas.
			 */
			setTimeout(() => {
				const { virus, setTimeOutTimer } = getVirusPositionAndTime();
				io.to(gameRoomId).emit("virusPositionsAndTime", virus, setTimeOutTimer);
			}, 3000);
		} // Slut på if(player1.reactionTime...)
	}); // Slut på socket.on("virusClicked")

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
