/**
 * Re-export Prisma Models to avoid circular dependencies between backend and frontend
 */

export {};

export interface Player {
    id: string;
    username: string;
    gameRoomId?: string | null;
    score: number;
    reactionTime?: number | null;
}

export interface GameRoom {
    id: string;
    gameOver: boolean;
    gameRound: number; 
    players?: Player[];
}

export interface PostGame{
    id: string;
    player1UserName: string;
    player1Score: number;
    player2UserName: string;
    player2Score: number;
}

