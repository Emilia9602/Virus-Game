import type { Socket } from "socket.io-client";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import type { Player } from "../../backend/generated/prisma/client";
import { createWinnerPage } from "./winnerPage";

export function createGamePage(
	nickname: string,
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	//------callback-funktion som byter vy och skickar tillbaka spelaren till lobbyn---------//
	// goToWaitingRoom: () => void,
): HTMLElement {
	console.log("LOG 15: createGamePage() called for:", nickname);

	const container = document.createElement("section");
	container.className = "game-page";

	/**
	 * CLEANUP
	 * Rensar gamla lyssnare innan vi skapar nya.
	 * Detta förhindrar att poäng räknas dubbelt eller att klockan buggar
	 * om man spelar flera matcher i rad.
	 */
	socket.off("playersInRoom");
	socket.off("showScores");
	socket.off("stopTimer");
	socket.off("playerRageQuit");
	socket.off("virusPositionsAndTime");

	// variabler
	let currentGameRoomId: string | null = null;
	let timerStartedAt: number = Date.now();
	let myTimer: number | null = null;
	let opponentTimer: number | null = null;
	let round = 0;

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

	// Skapa 100 grid-celler
	const gameArea = container.querySelector("#game-area") as HTMLElement;
	if (gameArea) {
		let cellsHTML = "";
		for (let i = 0; i < 100; i++) {
			cellsHTML += '<div class="grid-cell"></div>';
		}
		gameArea.innerHTML = cellsHTML;
	}

	// Hantera spelarlista och spara Room ID
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

	//Skapar upp knapp för att spela igen men döljer den
	const buttonWrapper = document.createElement("div");
	buttonWrapper.style.display = "none"; //Dölj knappen tills runda 10 är klar eller motspelare ragequitar
	buttonWrapper.style.textAlign = "center";

	const playAgainButton = document.createElement("button");
	playAgainButton.textContent = "Play Again";
	playAgainButton.className = "play-again-button";

	buttonWrapper.appendChild(playAgainButton);
	container.appendChild(buttonWrapper);

	//Skapar upp text om någon ragequitar men döljer den
	const gameOverWrapper = document.createElement("div");
	gameOverWrapper.className = "gameOverWrapper";
	gameOverWrapper.style.display = "none"; //Dölj rutan tills runda 10 är klar eller motspelare ragequitar
	gameOverWrapper.style.textAlign = "center";

	const gameOverText = document.createElement("p");
	gameOverText.textContent = "Username ragequit, push button play again";
	gameOverText.className = "game-over-text";

	gameOverWrapper.appendChild(gameOverText);
	container.appendChild(gameOverWrapper);

	//Hämta spelarnas poäng och uppdatera på sidan
	// In gamePage.ts (Client)
socket.on("showScores", (player1Score: number, player2Score: number) => {
    // Om player1 i listan är JAG, använd player1Score. Annars tvärtom.
    // Men det enklaste för debug är:
    console.log(`[SCORE DEBUG] Mottagna poäng: P1: ${player1Score}, P2: ${player2Score}`);

    const scoreEl = container.querySelector(".scores");
    if (scoreEl) {
        // Just nu visar du bara värdena rakt av
        scoreEl.textContent = `Player 1: ${player1Score} | Player 2: ${player2Score}`;
    }
});

	//Om en spelare ragequitar, visa namn och play again knapp - - - Behövs roomId här?
	socket.on("playerRageQuit", (username: string) => {
		//Visar spela igen knapp
		buttonWrapper.style.display = "block";
		gameOverWrapper.style.display = "block";
		gameOverText.textContent = `${username} ragequit, push button play again`;
	});

	// Virus-logik - Hjälpfunktioner för att hantera intervallerna
	const startMyTimer = () => {
		stopMyTimer();
		if (myTimer === null) {
			myTimer = setInterval(tick, 10);
		}
	};

	const startOpponentTimer = () => {
		stopOpponentTimer();
		if (opponentTimer === null) {
			opponentTimer = setInterval(tick, 10);
		}
	};

	const stopMyTimer = () => {
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

	/**
	 * REAL-TIME TICK LOGIC
	 * tick() räknar ut tidsskillnaden mellan nuet och när viruset visades
	 * Uppdaterar klockorna lokalt var 10:e millisekund
	 */
	const tick = () => {
		const timeElapsed = Date.now() - timerStartedAt;

		// Här räknas  sekunder med två decimaler direkt (t.ex. "1.20s")
		const latestTickTime = (timeElapsed / 1000).toFixed(2) + "s";

		const myStopWatch = container.querySelector(
			"#myStopWatch",
		) as HTMLSpanElement;
		const opponentStopWatch = container.querySelector(
			"#opponentStopWatch",
		) as HTMLSpanElement;

		if (myTimer !== null && myStopWatch) {
			myStopWatch.innerText = latestTickTime;
		}
		if (opponentTimer !== null && opponentStopWatch) {
			opponentStopWatch.innerText = latestTickTime;
		}
	};

	socket.on("virusPositionsAndTime", (virus) => {
		round++;
		if (round > 10) {
			socket.off("virusPositionsAndTime");
			return;
		}

		const virusElement = container.querySelector("#virus") as HTMLElement;
		const cells = container.querySelectorAll(".grid-cell");
		const cellIndex = virus.positionY * 10 + virus.positionX;
		const cell = cells[cellIndex] as HTMLElement;

		if (cell && virusElement) {
			/**
			 * NOLLSTÄLLNING VID NY RUNDA
			 * Vi nollställer klockorna visuellt först NU när nästa runda faktiskt startar.
			 * Detta gör att spelarna hinner se tiderna från förra rundan under pausen.
			 */
			const opponentClock = container.querySelector("#opponentStopWatch");
			const myClock = container.querySelector("#myStopWatch");
			if (opponentClock && myClock) {
				opponentClock.textContent = "0.00s";
				myClock.textContent = "0.00s";
			}

			// placera virus o visa det
			cell.appendChild(virusElement);
			virusElement.style.display = "flex";

			/**
			 * SYNKAD START
			 * Båda timers startar exakt när viruset ritas ut på skärmen
			 */
			timerStartedAt = Date.now();
			startMyTimer();
			startOpponentTimer();
		}

		virusElement.onclick = () => {
			/**
			 * PRECISION
			 * räknar ut reaktionstiden baserat på samma 'timerStartedAt' som klockan använder
			 */
			const reactionTime = Date.now() - timerStartedAt;

			// stoppa my timer
			stopMyTimer();

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
	// });socket.on("virusPositionsAndTime", (virus) => {
    // console.log("[CLIENT] Nytt virus mottaget från servern");

//     const virusElement = container.querySelector("#virus") as HTMLElement;
//     const cells = container.querySelectorAll(".grid-cell");
//     const cellIndex = virus.positionY * 10 + virus.positionX;
//     const cell = cells[cellIndex] as HTMLElement;

//     if (cell && virusElement) {
//         // Nollställning
//         const opponentClock = container.querySelector("#opponentStopWatch");
//         const myClock = container.querySelector("#myStopWatch");
//         if (opponentClock && myClock) {
//             opponentClock.textContent = "0.00s";
//             myClock.textContent = "0.00s";
//         }

//         // Placera virus och visa det
//         cell.appendChild(virusElement);
//         virusElement.style.display = "flex";

//         // Synkad start
//         timerStartedAt = Date.now();
//         startMyTimer();
//         startOpponentTimer();
//     }

//     virusElement.onclick = () => {
//         const reactionTime = Date.now() - timerStartedAt;

//         // Stoppa min timer lokalt direkt
//         stopMyTimer();

//         // Uppdatera klockan visuellt direkt
//         const myClock = container.querySelector("#myStopWatch");
//         if (myClock) {
//             myClock.textContent = `${(reactionTime / 1000).toFixed(2)}s`;
//         }

//         // Skicka till backend
//         if (currentGameRoomId) {
//             socket.emit("virusClicked", reactionTime, currentGameRoomId);
//         }

//         virusElement.style.display = "none";
//     };
// });

	/**
	 * Idividuellt stopp via socket
	 * lyssnar på servern för att veta när motståndarens klocka ska frysa
	 * för att se motståndarens klocka ticka hos dig tills DE klickar.
	 */
	socket.on("stopTimer", (isMe: boolean) => {
		if (isMe) {
			stopMyTimer();
		} else {
			// Detta fryser motståndarens klocka på DIN skärm när DE klickar
			stopOpponentTimer();
		}
	});

	// connect gamePage with winnerPage

socket.on("currentGameResult", (player1, player2) => {
    console.log("Spelet är slut, visar vinnarsidan");

    const winnerPage = createWinnerPage(player1, player2);
    const appContainer = document.querySelector("#app") || document.body;
    appContainer.innerHTML = "";

    appContainer.appendChild(winnerPage);
});

	return container;
}

