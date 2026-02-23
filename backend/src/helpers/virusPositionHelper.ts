import type { Virus } from "@shared/types/SocketEvents.types.ts";

export const getVirusPositionAndTime = () => {
	//Slumpar en position mellan 0 och 9 för x och y
	const positionX = Math.floor(Math.random() * 10);
	const positionY = Math.floor(Math.random() * 10);

	//Slumpar väntetid mellan 1,5 och 10sek
	const setTimeOutTimer = Math.random() * (10 - 1.5) + 1.5;

	//bygger ihop viruset och skickar tillbaka det
	const virus: Virus = {
		positionX,
		positionY,
	};

	return { virus, setTimeOutTimer };
};