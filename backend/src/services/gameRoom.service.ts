import { prisma } from "../lib/prisma.ts";

//Create room

export const createRoom = async () => {
	return await prisma.gameroom.create({
		data: {
			gameOver: false,
			gameRound: 0
		}
	});
}

export const getGameRooms = async () => {
	return await prisma.gameroom.findMany ({
		include: {
			players: true,
			_count: { select: { players: true } }
		}
	});
};
//Hitta ett rum som väntar på en motståndare
export const getAvailableRoom = async () => {
	return await prisma.gameroom.findFirst({
		where: {
			players: {
				some: {} //Kollar om det finns spelare
			},
			gameOver: false
		},
		include: {
			_count: {
				select: { players: true }
			}
		}
	}).then(room => {
		return room?._count.players === 1 ? room : null;
	});
};

//Koppla en spelare till ett rum
export const addPlayerToRoom = async (playerId: string, roomId: string) => {
	return await prisma.player.update({
		where: { id: playerId },
		data: { gameRoomId: roomId }
	});
};



