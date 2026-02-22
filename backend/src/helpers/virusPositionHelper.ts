import type { Virus } from "@shared/types/SocketEvents.types.ts";

export const getVirusPositionAndTime = () => {
	// Send to frontend random position x/y (0–9, matching the 10x10 grid indices)
	const positionX = Math.floor(Math.random() * 10);
	const positionY = Math.floor(Math.random() * 10);

	//Random Time - 1,5-10 sekunder
	const setTimeOutTimer = Math.random() * (10 - 1.5) + 1.5;

	//Construct payload
	const virus: Virus = {
		positionX,
		positionY,
	};

	return { virus, setTimeOutTimer };
};