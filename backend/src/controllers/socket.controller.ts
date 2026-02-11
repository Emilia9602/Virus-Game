/**
 * Socket Controller
 */
import { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.ts";

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

	//Skapa rum?

	//Anslut spelare till kö
	socket.on("playerJoinRequest", async (username, callback) => {

		const room = await prisma.room.create({
			data: {
				id: //Hur får jag nytt id här?
			},
		});

		//Några if här?

		const player = await prisma.player.create({
			data: {
				id: socket.id,
				roomId: room,
				username,
			}
		});
	})

	//Vänta på 2 spelare

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
