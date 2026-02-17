/**
 * Socket Controller
 */
// backend/src/controllers/socket.controller.ts
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
	//resetPlayerTimer,
	//updatePlayerScores,
	//updatePlayerTimer,
} from "../services/player.service.ts";
import {
	createRoom,
	//updateGameRoomRounds,
	// getGameRooms,
	addPlayerToRoom,
	getAvailableRoom,
} from "../services/gameRoom.service.ts";
//import { createPostGame } from "../services/postgame.service.ts";
// import { GameRoom } from "@shared/types/Models.types.ts";
import { getVirusPositionAndTime } from "../helpers/virusPositionHelper.ts";

const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	io: Server<ClientToServerEvents, ServerToClientEvents>,
) => {
	debug("🙋 A user connected with id: %s", socket.id);

	// Hantera disconnect
	socket.on("disconnect", async () => {
		debug("👋 A user disconnected with id: %s", socket.id);

		//Hämta spelaren
		const player = await getPlayerInRoom(socket.id);
		//Kolla om spelaren finns
		if (!player) {
			debug("Spelaren finns inte");
			return;
		}

		//Hämta spelarens gameRoomId
		const playerRoomId = player.gameRoomId;
		//Kolla om spelaren har ett gameRoomId
		if (!playerRoomId) {
			debug("Spelrumid finns inte");
			return;
		}

		//Ta bort spelare med socket.id
		await deletePlayerInRoom(player.id);

		//Berätta för den andra spelaren att motståndaren rageQuita
		io.to(playerRoomId).emit("playerRageQuit", player.username);
	});

	// Spelare ansluter till kö
	socket.on("playerJoinRequest", async (username, callback) => {
		try {
			debug("playerJoinRequest mottagen från: %s", socket.id);

			let gameRoom = await getAvailableRoom();
			debug("Hittade rum: %s", gameRoom?.id ?? "inget rum hittades");

			// resten av koden...

		// 3.Om ej ledigt rum finns - skapa ett nytt
		if (!gameRoom) {
			gameRoom = await createRoom();
		}

		if (!gameRoom) {
			debug("Kunde inte skapa eller hitta rum");
			callback({ success: false, gameRoomId: ""});
			return;
		}

		// 4. Joina (socket.io) game-rummet
		socket.join(gameRoom.id);

		// 5. Skapa spelare/användare
		await createPlayer({
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
			io.to(gameRoom.id).emit("startGameCountDown"); // skicka t frontend

			let count = 3;
			const countdownInterval = setInterval(async () => {
				io.to(gameRoom.id).emit("countDown", count);
			count--;

			if (count < 0) {
				clearInterval(countdownInterval);

				//Skapa nytt spelrum
				const newGameRoom = await createRoom();


				//Flytta båda spelarna till det nya rummet
				for (const p of playersInRoom) {
					await addPlayerToRoom(p.id, newGameRoom.id);
					io.sockets.to(p.socketId).socketsJoin(newGameRoom.id);
				}

				//Lämna waiting room
				io.socketsLeave(gameRoom.id);

				//Skicka virusposition till nya rummet
				const { virus, setTimeOutTimer } = getVirusPositionAndTime();
				io.to(newGameRoom.id).emit("virusPositionsAndTime", virus, setTimeOutTimer);
				}
			}, 1000);
		} else {
			io.to(gameRoom.id).emit("waiting");
			}
		} catch (err) {
			debug("Error in playerJoinRequest:", err);
			console.error("Error:", err);
		}
		});





/*
	// Här kan du lägga till:

	// - Countdown till spelet startar
	socket.on("countDown", async (callback) => {
		const player = await getPlayerInRoom(socket.id);
		//Kolla om spelaren finns
		if (!player) {
			debug("Spelaren finns inte");
			return;
		}

		//Hämta spelarens gameRoomId
		const playerRoomId = player.gameRoomId;
		//Kolla om spelaren har ett gameRoomId
		if (!playerRoomId) {
			debug("Spelrumid finns inte");
			return;
		}

		const three = 3;
		const two = 2;
		const one = 1;

		// Hämta alla spelare i rummet
		const playersInRoom = await getPlayersInRoom(playerRoomId);

		//Tänkte kolla här om det finns 2 spelare, starta countdown..
		setTimeout(() => {
			callback(three);
		}, 1000);

		//Är jag helt ute och cyklar? Ska detta vara i main.ts istället?
	});

	// - Slumpa virus-position och tid

	// - Hantera spelrundor, reaktionstid och poäng
	socket.on("updateGameStatus", async (data) => {
		//Hämta spelaren
		const player = await getPlayerInRoom(socket.id);
		//Kolla om spelaren finns
		if (!player) {
			debug("Spelaren finns inte");
			return;
		}

		//Hämta spelarens gameRoomId
		const playerRoomId = player.gameRoomId;
		//Kolla om spelaren har ett gameRoomId
		if (!playerRoomId) {
			debug("Spelrumid finns inte");
			return;
		}

		//Hämta gameRoom för spelaren
		const gameRoom = await getGameRoom(playerRoomId);
		//Kolla om gameRoom finns
		if (!gameRoom) {
			debug("Spelrum finns inte");
			return;
		}

		//Hämta båda spelarna i gameRoom
		const players = await getPlayersInRoom(gameRoom.id);
		const player2 = players[1]; //Får jag tag i andra spelaren såhär?

		//Hur får jag tag i spelarens reactionTime?
		//Kolla om spelarna har en reactionTime
		if (!player.reactionTime || !player2.reactionTime) {
			debug("En eller båda av spelarna har ingen reaktionstid");
			return;
		}

		//Uppdatera spelarens reactionTime
		await updatePlayerTimer(player.id, player.reactionTime);

		//Uppdatera spelarens poäng
		if (player.reactionTime > player2.reactionTime) {
			//Om spelaren är snabbast =>
			await updatePlayerScores(player.id);
		}

		//Uppdatera rundorna i gameRoom
		await updateGameRoomRounds(playerRoomId);

		//Om det är spelrunda 10, gameOver
		if (gameRoom.gameRound === 10) {
			//Avsluta spelet
			gameRoom.gameOver = true;
		}

		//Skicka uppdaterad poängställnng och game status
		io.to(playerRoomId).emit("showUpdatedGameStatus", data);

		//Återställ timern för reactionTime
		await resetPlayerTimer(player.id);

		//Börja om, hur gör man det?
	});

	// - Hantera slutspel efter 10 rundor
	socket.on("updateResult", async () => {
		const player = await getPlayerInRoom(socket.id);
		//Kolla om spelaren finns
		if (!player) {
			debug("Spelaren finns inte");
			return;
		}

		//Hämta spelarens gameRoomId
		const playerRoomId = player.gameRoomId;
		//Kolla om spelaren har ett gameRoomId
		if (!playerRoomId) {
			debug("Spelrumid finns inte");
			return;
		}

		//Hämta gameRoom för spelaren
		const gameRoom = await getGameRoom(playerRoomId);
		//Kolla om gameRoom finns
		if (!gameRoom) {
			debug("Spelrum finns inte");
			return;
		}

		//Hämta båda spelarna i gameRoom
		const players = await getPlayersInRoom(gameRoom.id);

		//Om det gått 10 rundor, skicka resultatet
		if (gameRoom.gameOver === true) {
			const result = await createPostGame(players);

			io.to(playerRoomId).emit("showResult", result);
		}
	});
};
*/
};
