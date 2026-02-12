/**
 * Socket Controller
 */
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.ts";
import { createPlayer, getPlayersInRoom } from "../services/player.service.ts";
import { createRoom } from "../services/room.service.ts";

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

		//If med kontroller på username?

		const player = await createPlayer({
			id: socket.id,
			username: username,
			gameRoomId: "",
			score: 0,
			reactionTime: 0
		});

		//GameRoom, om det finns ledigt, hoppa in där, annars skapa nytt
		const rooms = await getGameRooms(); //Tex

		if (rooms.players === ) //Om där är 1 spelare som väntar, hur skriva?
		{ addPlayerToGameRoom();} //Lägg till spelare i rum, gå vidare till spel
		else {
			//Skapa nytt rum att köa/spela i
		await createRoom();
		await addPlayerToGameRoom(); //Så att spelaren läggs till i rummet?
		}

		//Lägg in vilket rum spelaren joina
		const gameRoomId = player.gameRoomId;

		//Joina rum?
		socket.join(gameRoomId);

		//Sätt roomId till player?
		const playersInRoom = await getPlayersInRoom(room.id);

		callback({
			success: true,
			room: {
				...room,
				players: playersInRoom,
			},
		});
	})

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
