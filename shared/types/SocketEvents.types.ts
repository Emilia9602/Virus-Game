/**
 * Socket Event Types
 */
import type { Player, GameRoom } from "../../backend/generated/prisma/client.ts"

export {}

// Events emitted by the server to the client
export interface ServerToClientEvents {
    startGame: () => void;
    countDown: (number: number) => void;
    showUpdatedGameStatus: (data: UpdateGameStatus) => void;
    showOpponentTimer: (data: number) => void;
    showScores: (player1Score: number, player2Score: number) => void;
    showResult: (data: GameResult) => void;
    playerRageQuit: (username: string, gameRoomId: string) => void;
    playersInRoom: (players: Player[]) => void;
    virusPositionsAndTime: (data: Virus, randomTime: number) => void;
    waiting: () => void;
    stopTimer: (playerId: boolean) => void;
    currentGameResult: (player1: Player, player2: Player) => void;
}

// Events emitted by the client to the server
export interface ClientToServerEvents {
    playerJoinRequest: (
        username: string,
        callback: (response: PlayerJoinResponse) => void
    ) => void;

    updateTimer: (
        reactionTime: number, 
       // playerId: string,
    ) => void;

    //Se om denna används
    updateGameStatus: (
        data: UpdateGameStatus,
        callback: (response: UpdateGameStatus) => void
    ) => void;

    updateResult: (
        data: GameResult,
        callback: (response: GameResult) => void
    ) => void;

    countDown: (
        data: CountDown,
        callback: (threeTwoOne: CountDown) => void
    ) => void;
    virusClicked: (reactionTime: number, gameRoomId: string) => void;
    //-----ber servern att få spela igen, (play again knapp)------/
    // playAgainRequest: () => void;
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

//Se om denna används
export interface UpdateGameStatus {
    gameRound: number,
    reactionTime: number,
    score: number,
}

export interface GameResult {
    player1UserName: string,
    player1Score: number,
    player2UserName: string,
    player2Score: number,
}

export interface CountDown {
    threeTwoOne: number[],
}

export interface Virus {
    positionX: number;
    positionY: number;
}