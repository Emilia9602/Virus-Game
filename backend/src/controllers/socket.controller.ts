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
	deleteGameRoom,
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
	socket.on("virusClicked", async (reactionTime: number, gameRoomId: string) => {
		debug("Click received from %s. Time: %d ms", socket.id, reactionTime);

		const player = await getPlayerInRoom(socket.id);
		if (!player) {
			console.error(`[DB ERROR] No player found for socket ${socket.id}`);
			return;
		}

		await updatePlayerTimer(socket.id, reactionTime);
		socket.to(gameRoomId).emit("showOpponentTimer", reactionTime);

		const players = await getPlayersInRoom(gameRoomId);
		if (players.length < 2) return;

		const [player1, player2] = players;
		io.to(player1.id).emit("stopTimer", player1.id === socket.id);
		io.to(player2.id).emit("stopTimer", player2.id === socket.id);

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
			// Hämta de ABSOLUT senaste poängen från DB nu
			//const playersInRoom = await getPlayersInRoom(gameRoomId);
			//const p1 = playersInRoom[0];
			//const p2 = playersInRoom[1];

			// Skicka showScores (enligt interface: p1Score, p2Score)
			// Se till att p1 och p2 skickas i samma ordning varje gång!
			//io.to(gameRoomId).emit("showScores", p1.score, p2.score);

			// Uppdatera runda
			await updateGameRoomRounds(gameRoomId);
			const gameRoom = await getGameRoom(gameRoomId);

			console.log(`[ROUND CHECK] DB säger att runda är: ${gameRoom?.gameRound}`);
			console.log(`[DEBUG] Runda avklarad: ${gameRoom?.gameRound}/10`);

			// Kolla Game Over (Använd 10 istället för 2)
			if (gameRoom && gameRoom.gameRound !== null && gameRoom.gameRound >= 10) {
				console.log("!!! GAME OVER TRIGGAT !!!");
				io.to(gameRoomId).emit("currentGameResult", updatedPlayers[0], updatedPlayers[1]);
				//Rensar spelarna och rummet från DB så play again fungerar
				await deletePlayerInRoom(updatedPlayers[0].id);
				await deletePlayerInRoom(updatedPlayers[1].id);
				await deleteGameRoom(gameRoomId);

				return; // Här dör spelet
			}

			// Reset inför nästa runda
			await resetPlayerTimer(gameRoomId);
			setTimeout(() => {
				const { virus, setTimeOutTimer } = getVirusPositionAndTime();
				io.to(gameRoomId).emit("virusPositionsAndTime", virus, setTimeOutTimer);
			}, 3000);
		}
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
