import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";

export function createGamePage(nickname: string, socket: Socket<ServerToClientEvents, ClientToServerEvents>): HTMLElement {
    console.log("LOG 15: createGamePage() called for:", nickname);

    const container = document.createElement("section");
    container.className = "game-page";

    container.innerHTML = `
        <div class="game-ui">
            <h2>Welcome, ${nickname}!</h2>
            <div class="game-status">Waiting for virus...</div>
            <div class="scores">You: 0 | Opponent: 0</div>
        </div>

        <div class="game-board-wrapper" style="width: 600px; height: 600px; margin: 0 auto; border: 5px solid #333;">
            <div id="game-area" class="gridSystem">
                <div id="virus" class="virus-target" style="display: none; cursor: pointer; font-size: 2rem; display: flex; align-items: center; justify-content: center;">
                    🦠
                </div>
            </div>
        </div>
    `;

	//Skapa 100 grid-celler
	const gameArea = container.querySelector("#game-area");
	if (gameArea) {
		for (let i = 0; i < 100; i++) {
			const cell = document.createElement("div");
			cell.className = "grid-cell";
			gameArea.appendChild(cell);
		}
	}
	//Lyssnar på virusposition från backend, tar bort tidigare lyssnare för att undvika dubbla event
	socket.off("virusPositionsAndTime");

	let round = 0;
	socket.on("virusPositionsAndTime", (virus, _timer) => {
		round++;
		if (round > 10) {
			socket.off("virusPositionsAndTime");
			console.log("Game over efter 10 rundor");
			return;
		}

		//Sparar tiden när viruset visas för att kunna räkna ut reaktionstiden när spelaren klickar
		const virusShownAt = Date.now();
		const virusElement = document.getElementById("virus") as HTMLElement;
		const gameArea = document.getElementById("game-area");
		if (!virusElement || !gameArea) return;

		//Räknar ut vilken grid-cell viruset ska placeras i baserat på positionX och positionY, och flyttar virusElement dit
		const cells = gameArea.querySelectorAll(".grid-cell");
		const cellIndex = virus.positionY * 10 + virus.positionX;
		const cell = cells[cellIndex];
		if(!cell) return;

		//Flyttar virusElement till den nya cellen och visar det
		cell.appendChild(virusElement);
		virusElement.style.display = "flex";

		//När spelaren klickar på viruset, räknar ut reaktionstiden och skickar den till backend
		virusElement.onclick = () => {
			const reactionTime = Date.now() - virusShownAt;
			socket.emit("virusClicked", reactionTime);
		};
	});

    console.log("LOG 15.1: Grid structure created with innerHTML and .gridSystem");
    return container;
}
