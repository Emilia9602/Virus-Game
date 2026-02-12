/**
 * Socket Event Types
 */
import type { Player, GameRoom } from "../../backend/generated/prisma/client.ts"

export {}

// Events emitted by the server to the client
export interface ServerToClientEvents {
    startGameCountdown: () => void;
    showUpdatedGameStatus: (data: UpdateGameStatus) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
    playerJoinRequest: (
        username: string,
        callback: (response: PlayerJoinRequest) => void
    ) => void;

    updateGameStatus: (
        data: UpdateGameStatus,
        callback: (response: UpdateGameStatus) => void
    ) => void;
}

// RoomWithPlayers extends GameRoom and adds players array and count
export interface RoomWithPlayers extends GameRoom {
    players: Player[];
    _count: {
        players: number;
    };
}

export interface PlayerJoinRequest {
    success: boolean;
    gameRoom: RoomWithPlayers | null;
}

export interface UpdateGameStatus {
    gameRound: number,
    reactionTime: number,
    score: number,
}