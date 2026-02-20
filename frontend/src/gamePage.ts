import type { Socket } from "socket.io-client";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import type { Player } from "../../backend/generated/prisma/client";

export function createGamePage(
	nickname: string,
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
<<<<<<< Updated upstream
): HTMLElement {
	console.log("LOG 15: createGamePage() called for:", nickname);
=======
	goToWaitingRoom: () => void,
): HTMLElement {
    console.log("LOG 15: createGamePage() called for:", nickname);
>>>>>>> Stashed changes

	const container = document.createElement("section");
	container.className = "game-page";

	// variabler
	let currentGameRoomId: string | null = null;
	let timerStartedAt: number | null = null;
	let myTimer: number | null = null;
	let opponentTimer: number | null = null;

	container.innerHTML = `
        <div class="game-ui">
            <h2>Welcome, ${nickname}!</h2>
            <div class="game-status">Waiting for virus...</div>
            <div id="playerTimers" class="timer-container" style="display: flex; gap: 20px; justify-content: center; margin-bottom: 10px;">
                </div>
            <div class="scores">You: 0 | Opponent: 0</div>
        </div>

        <div class="game-board-wrapper" style="width: 600px; height: 600px; margin: 0 auto; border: 5px solid #333; position: relative;">
            <div id="game-area" class="gridSystem"></div>
            <div id="virus" class="virus-target" style="display: none; cursor: pointer; font-size: 2rem; position: absolute; z-index: 10;">
                🦠
            </div>
        </div>
    `;




	// 1. Skapa 100 grid-celler
	const gameArea = container.querySelector("#game-area") as HTMLElement;
	if (gameArea) {
		let cellsHTML = "";
		for (let i = 0; i < 100; i++) {
			cellsHTML += '<div class="grid-cell"></div>';
		}
		gameArea.innerHTML = cellsHTML;
	}

	// 2. Hantera spelarlista och spara Room ID
	socket.on("playersInRoom", (players: Player[]) => {
		const playerTimerEl = container.querySelector("#playerTimers");
		if (playerTimerEl && players.length > 0) {
			// Spara rummets ID från första bästa spelare
			currentGameRoomId = players[0].gameRoomId;

			playerTimerEl.innerHTML = players
				.map((player) => {
					const isMe = player.id === socket.id;
					const label = isMe
						? `${player.username} (Du)`
						: player.username;
					const timerId = isMe ? "myStopWatch" : "opponentStopWatch";

					return `
                        <div class="player-box">
                            <span>${label}</span>
                            <span id="${timerId}" style="font-family: monospace; font-weight: bold;">0.00s</span>
                        </div>`;
				})
				.join("");
		}
	});

	//2.1 Hämta motspelarens reactionTime och skriv ut
	socket.on("showOpponentTimer", (data: number) => {
		const opponentClock = container.querySelector("#opponentStopWatch");
		if (opponentClock) {
			opponentClock.textContent = `${(data / 1000).toFixed(2)}s`;
		}
	});

	//2.2 Hämta spelarnas poäng och uppdatera på sidan
	socket.on("showScores", (player1Score: number, player2Score: number) => {
		const scoreEl = container.querySelector(".scores");
		if (scoreEl) {
			scoreEl.textContent = `You: ${player1Score} | Opponent: ${player2Score}`;
		}
	});

	// 3. Virus-logik
	socket.off("virusPositionsAndTime");
	let round = 0;

	socket.on("virusPositionsAndTime", (virus) => {
		round++;
		if (round > 10) {
			socket.off("virusPositionsAndTime");
			return;
		}

		//Nollställ timers när nytt virus visas
		const opponentClock = container.querySelector("#opponentStopWatch");
		const myClock = container.querySelector("#myStopWatch");
		if (opponentClock && myClock) {
			opponentClock.textContent = "0.00s";
			myClock.textContent = "0.00s";
		}

		const virusShownAt = Date.now();
		const virusElement = container.querySelector("#virus") as HTMLElement;
		const cells = container.querySelectorAll(".grid-cell");

		const cellIndex = virus.positionY * 10 + virus.positionX;
		const cell = cells[cellIndex] as HTMLElement;

		if (cell && virusElement) {
			cell.appendChild(virusElement);
			virusElement.style.display = "flex";
		}

		virusElement.onclick = () => {
			const reactionTime = Date.now() - virusShownAt;

			// Uppdatera din egen klocka direkt i UI för omedelbar feedback
			const myClock = container.querySelector("#myStopWatch");
			if (myClock) {
				myClock.textContent = `${(reactionTime / 1000).toFixed(2)}s`;
			}

			// Skicka till backend (nu med rummet vi sparade!)
			if (currentGameRoomId) {
				socket.emit("virusClicked", reactionTime, currentGameRoomId);
			}

			virusElement.style.display = "none";
		};
	});

<<<<<<< Updated upstream
	socket.on("stopTimer", (isCurrentPlayer) => {
		if (isCurrentPlayer) {
			stopTimer();
		} else {
			stopOpponentTimer();
		}
	});

	const stopTimer = () => {
		if (myTimer !== null) {
			clearInterval(myTimer);
			myTimer = null;
		}
	};

	const stopOpponentTimer = () => {
		if (opponentTimer !== null) {
			clearInterval(opponentTimer);
			opponentTimer = null;
		}
	};

	// Lyssna på poänguppdateringar från backend
	/*socket.on("showUpdatedGameStatus", (data) => {
		// Uppdatera "scores"
		const scoreEl = container.querySelector(".scores");
		if (scoreEl) {
			// uppdaterad bådas poäng
			console.log("Poäng uppdaterad:", data.score);
		}
	});*/

	return container;
}
=======
    console.log("LOG 15.1: Grid structure created with innerHTML and .gridSystem");

	const playAgainButton = document.createElement("button");
	playAgainButton.textContent = "Play Again";
	playAgainButton.className = "play-again-button";
	playAgainButton.onclick = () => {
		goToWaitingRoom();
	};
	return container;

}
>>>>>>> Stashed changes
