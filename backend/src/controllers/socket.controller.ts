/**
 * Socket Controller
 */
// backend/src/controllers/socket.controller.ts
import type { ClientToServerEvents, ServerToClientEvents, PlayerJoinRequest } from "@shared/types/SocketEvents.types.ts";
import Debug from "debug";
import { Server, Socket } from "socket.io";
import { createPlayer, getPlayersInRoom } from "../services/player.service.ts";
import { createRoom, getAvailableRoom, addPlayerToRoom } from "../services/Gameroom.service.ts";

const debug = Debug("backend:socket_controller");
debug("Socket Controller initialized");

export const handleConnection = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    _io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
    debug("🙋 A user connected with id: %s", socket.id);

    // Hantera disconnect
    socket.on("disconnect", () => {
        debug("👋 A user disconnected with id: %s", socket.id);
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
    // - Slumpa virus-position och tid
    // - Hantera spelrundor, reaktionstid och poäng
    // - Skicka uppdaterad poängställning
    // - Hantera slutspel efter 10 rundor
};