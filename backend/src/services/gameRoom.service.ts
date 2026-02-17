import { Player } from "../../generated/prisma/client.ts";
import { prisma } from "../lib/prisma.ts";


// Skapar ett nytt GameRoom
export const createRoom = async () => {
	return await prisma.gameRoom.create({
		data: {
			gameOver: false, // Spelet är inte över när rummet skapas
			gameRound: 0,    // Börja på runda 0
		},
		include: {
			players: true,
			_count: { select: { players: true} },
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
			//_count: { select: { players: true } }, // Räkna antalet spelare
},
	});
};

// Hitta ett ledigt rum (med exakt 1 spelare) som väntar på motståndare
export const getAvailableRoom = async () => {
	const rooms = await prisma.gameRoom.findMany({ //Hämta alla aktiva rum
		where: {
			gameOver: false, // Rummet måste vara aktivt
		},
		include: {
			players: true, // Hämta spelarna
			_count: { select: { players: true } }, // Räkna antalet spelare
		},
	});

	//Hitta första rummet som har exakt 1 spelare
	const availableRoom = rooms.find(room => room._count.players < 2);
	return availableRoom ?? null;
	};

// Koppla en spelare till ett rum
export const addPlayerToRoom = async (playerId: string, roomId: string): Promise<Player> => {
	return await prisma.player.update({
		where: { id: playerId },
		data: { gameRoomId: roomId },
	});
};

//Uppdatera spelrundans poäng
export const updateGameRoomRounds = async (gameRoomId: string) => {
	return await prisma.gameRoom.update({
		where: { id: gameRoomId },
		data: {
			gameRound: {
				increment: 1,
			},
		},
	});
};
