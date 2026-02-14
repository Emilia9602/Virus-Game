/**
 * Socket Controller
 */
// backend/src/controllers/socket.controller.ts
import type { ClientToServerEvents, ServerToClientEvents, PlayerJoinRequest } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { createPlayer, deletePlayerInRoom, getPlayerInRoom, getPlayersInRoom, resetPlayerTimer, updatePlayerScores, updatePlayerTimer } from "../services/player.service.ts";
import { createRoom, getAvailableRoom, addPlayerToRoom, getGameRoom, updateGameRoomRounds } from "../services/gameRoom.service.ts";
import { createPostGame } from "../services/postgame.service.ts";

const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	_io: Server<ClientToServerEvents, ServerToClientEvents>
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
		deletePlayerInRoom(player.id);

		//Berätta för den andra spelaren att motståndaren rageQuita
		_io.to(playerRoomId).emit("playerRageQuit", player.username);

	});

	// Spelare ansluter till kö
	socket.on("playerJoinRequest", async (username, callback) => {
		try {
			// Skapa spelare
			const player = await createPlayer({
				id: socket.id,
				username,
				gameRoomId: "",
				score: 0,
				reactionTime: 0, // Prisma-genererat fält
			});

			// Hitta ledigt rum eller skapa nytt
			const room = await getAvailableRoom() ?? await createRoom();

			// Koppla spelare till rummet
			await addPlayerToRoom(player.id, room.id);

			// Joina socket.io rummet
			socket.join(room.id);

			// Hämta alla spelare i rummet
			const playersInRoom = await getPlayersInRoom(room.id);

			// Skapa korrekt PlayerJoinRequest med _count
			const response: PlayerJoinRequest = {
				success: true,
				gameRoom: {
					id: room.id,
					gameOver: room.gameOver,
					gameRound: room.gameRound,
					players: playersInRoom,
					_count: {
						players: playersInRoom.length,
					},
				},
			};

			// Skicka svar till klienten
			callback(response);

			// Om rummet är fullt (2 spelare), starta spelet
			if (playersInRoom.length === 2) {
				_io.to(room.id).emit("startGameCountdown");
			}
		} catch (error) {
			debug("Fel vid playerJoinRequest: %o", error);
			callback({ success: false, gameRoom: null });
		}
	});

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
			}, 1000)

			//Är jag helt ute och cyklar? Ska detta vara i main.ts istället?
	})

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
		_io.to(playerRoomId).emit("showUpdatedGameStatus", data);

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

			_io.to(playerRoomId).emit("showResult", result);
		}
	})
};
