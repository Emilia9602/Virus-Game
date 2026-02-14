import { Player } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";


// Skapar ett nytt GameRoom
export const createRoom = async () => {
	return await prisma.gameRoom.create({
		data: {
			gameOver: false, // Spelet är inte över när rummet skapas
			gameRound: 0,    // Börja på runda 0
		},
	});
};

//Hämta GameRoom
export const getGameRoom = async (playerRoomId: string) => {
	return await prisma.gameRoom.findUnique({
		where: {
			id: playerRoomId,
		}
	});
}

// Hämtar alla GameRooms med spelare
export const getGameRooms = async () => {
	return await prisma.gameRoom.findMany({
		include: {
			players: true, // Inkludera alla spelare i rummet
			_count: { select: { players: true } }, // Räkna antalet spelare
		},
	});
};

// Hitta ett ledigt rum (med exakt 1 spelare) som väntar på motståndare
export const getAvailableRoom = async () => {
	const room = await prisma.gameRoom.findFirst({
		where: {
			gameOver: false, // Rummet måste vara aktivt
		},
		include: {
			players: true, // Hämta spelarna
			_count: { select: { players: true } }, // Räkna antalet spelare
		},
	});

	// Kolla om rummet har exakt 1 spelare, annars returnera null
	if (room && room._count.players === 1) return room;
	return null;
};

// Koppla en spelare till ett rum
export const addPlayerToRoom = async (playerId: string, roomId: string): Promise<Player> => {
	return await prisma.player.update({
		where: { id: playerId },
		data: { gameRoomId: roomId },
	});
};

//Uppdatera spelrundans poäng
export const updateGameRoomRounds = async (playerRoomId: string) => {
	return await prisma.gameRoom.update({
		where: { id: playerRoomId },
		data: {
			gameRound: {
				increment: 1,
			},
		},
	});
};
