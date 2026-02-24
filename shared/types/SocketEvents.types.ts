/**
 * Socket Event Types
 */
import type { Player, GameRoom } from "../../backend/generated/prisma/client.ts"

export {}

// Events emitted by the server to the client
export interface ServerToClientEvents {
    startGame: () => void;
    countDown: (number: number) => void;
    showOpponentTimer: (data: number) => void;
    showScores: (player1Score: number, player2Score: number) => void;
    playerRageQuit: (username: string, gameRoomId: string) => void;
    playersInRoom: (players: Player[]) => void;
    virusPositionsAndTime: (data: Virus, randomTime: number) => void;
    waiting: () => void;
    stopTimer: (playerId: boolean) => void;
    currentGameResult: (player1: Player, player2: Player) => void;
    showLiveScore: (gamesInProgress: ShowLiveScore[]) => void;
    showRecentGames: (latestGames: GameResult[]) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
    playerJoinRequest: (
        username: string,
        callback: (response: PlayerJoinResponse) => void
    ) => void;

    updateTimer: (
        reactionTime: number, 
    ) => void;

    updateResult: (
        data: GameResult,
        callback: (response: GameResult) => void
    ) => void;

    //Används denna? Annars ta bort
    countDown: (
        data: CountDown,
        callback: (threeTwoOne: CountDown) => void
    ) => void;
    virusClicked: (reactionTime: number, gameRoomId: string) => void;
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

export interface PlayerJoinResponse{
    success: boolean;
    gameRoomId: string;
}

export interface UpdateTimer {
    reactionTime: number,
}

export interface GameResult { 
    player1UserName: string,
    player1Score: number,
    player2UserName: string,
    player2Score: number,
}

//Används denna? Annars ta bort
export interface CountDown {
    threeTwoOne: number[],
}

export interface Virus {
    positionX: number;
    positionY: number;
}

export interface ShowLiveScore {
    id: string;
    gameRound: number | null;
    players: Player[]; 
}