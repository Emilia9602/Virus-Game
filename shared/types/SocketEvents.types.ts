import type { Player, GameRoom } from "../../backend/generated/prisma/client"
export {}

// Events emitted by the server to the client
export interface ServerToClientEvents {

}

// Events emitted by the client to the server
export interface ClientToServerEvents {

    playerJoinRequest: (
        username: string,
        //roomId: string,
        callback: (response: PlayerJoinRequest) => void
    ) => void;
}

export interface RoomWithPlayers extends GameRoom {
    players: Player[];
}

export interface PlayerJoinRequest {
    success: boolean;
    gameRoom: RoomWithPlayers | null;
}
