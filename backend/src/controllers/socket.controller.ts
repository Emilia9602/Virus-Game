/**
 * Socket Controller
 */
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.ts";
import { createPlayer, getPlayersInRoom } from "../services/player.service.ts";
import { createRoom, getAvailableRoom, addPlayerToRoom } from "../services/room.service.ts";
import { getAvailableRoom } from "../services/Gameroom.service.ts";

// Create a new debug instance
const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

// Handle new socket connection
export const handleConnection = (
	socket: Socket<ClientToServerEvents, ServerToClientEvents>,
	_io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
	// Yay someone connected to me
	debug("🙋 A user connected with id: %s", socket.id);

	// Handle user disconnecting
	socket.on("disconnect", () => {
		debug("👋 A user disconnected with id: %s", socket.id);
	});

	//Anslut spelare till kö
	socket.on("playerJoinRequest", async (username, callback) => {
		try {
			const player = await createPlayer({
				id: socket.id,
				username: username,
				gameRoomId: "",
				score: 0,
				reactionTime: 0
			  });

			//Hitta ett rum
		let room = await getAvailableRoom(); //Hitta ett rum som väntar på en motståndare
		if (!room) {
			room = await createRoom(); //Om inget ledigt rum, skapa ett nytt
		}

		//Lägg till spelaren i rummet
		await addPlayerToGameRoom(player.id, room.id);

		//Joina socket.io rummet
		socket.join(room.id);

		//Hämta alla spelare i rummet
		const playersInRoom = await getPlayersInRoom(room.id);

		//Skicka svar till klienten
		callback ({
			success: true,
			room: {
				id: room.id,
				players: playersInRoom,
			},
		});

		//Om rummet är fullt (2 spelare), starta spelet
		if (playersInRoom.length === 2) {
			_io.to(room.id).emit("startGameCountdown");
		}
	} catch (error) {
		debug("Fel vid playerJoinRequest: %o", error);
		callback({ success: false });
		}
	});



	//2 spelare, countdown till att spelet startar

	//Servern slumpar position för virus

	//Servern slumpar tiden till att virus visas för spelare

	//Servern skickar samtidigt till båda klienter så de får
	//upp viruset samtidigt

	//Servern väntar på klick från båda spelarna

	//När en spelare tryckt skickar klienten tiden och räknar ut reaktionstiden

	//När båda tryckt, jämför reaktion och snabbast får poäng

	//Servern skickar uppdaterad poängställning

	//Nästa runda fram till 10

	//10 rundor - Slutspelat, vem vann?
}
