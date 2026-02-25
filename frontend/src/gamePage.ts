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
	goToWaitingRoom: () => void,
	goToFirstPage: () => void,
): HTMLElement {
	console.log("LOG 15: createGamePage() called for:", nickname);

	const container = document.createElement("section");
	container.className = "game-page";

	//Rensar gamla socket-lyssnare
	socket.off("playersInRoom");
	socket.off("showScores");
	socket.off("stopTimer");
	socket.off("playerRageQuit");
	socket.off("virusPositionsAndTime");
	socket.off("currentGameResult");

	let currentGameRoomId: string | null = null;
	let timerStartedAt: number = Date.now();
	let myTimer: number | null = null;
	let opponentTimer: number | null = null;
	let round = 0;
	let myName: string = "";
	let opponentName: string = "";
	let iAmP1: boolean = false;

	container.innerHTML = `
        <div class="game-ui">
            <h2 style="display: flex; gap: 20px; justify-content: center; margin-bottom: 10px;">Welcome ${nickname}!</h2>
            <div class="game-status" style="display: flex; gap: 20px; justify-content: center; margin-bottom: 10px;">How fast are you?</div>
            <div id="playerTimers" class="timer-container" style="display: flex; gap: 20px; justify-content: center; margin-bottom: 10px;"></div>
            <div class="scores" style="display: flex; gap: 20px; justify-content: center; margin-bottom: 10px;"></div>
        </div>

        <div class="game-board-wrapper" style="width: 600px; height: 600px; margin: 0 auto; border: 5px solid #333; position: relative;">
            <div id="game-area" class="gridSystem"></div>
            <div id="virus" class="virus-target" style="display: none; cursor: pointer; font-size: 2rem; position: absolute; z-index: 10;">🦠</div>

            <div id="countdown-overlay" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 100; border-radius: 4px;">
                <span id="countdown-number" style="font-size: 8rem; font-weight: bold; color: #fff; font-family: monospace; text-shadow: 0 0 30px rgba(255,255,255,0.6);">3</span>
            </div>
        </div>
    `;

	const gameArea = container.querySelector("#game-area") as HTMLElement;
	if (gameArea) {
		let cellsHTML = "";
		for (let i = 0; i < 100; i++) {
			cellsHTML += '<div class="grid-cell"></div>';
		}
		gameArea.innerHTML = cellsHTML;
	}

	const virusElement = container.querySelector("#virus") as HTMLElement;

	// --- MODAL FUNKTION ---
	const showRageQuitModal = (username: string, onConfirm: () => void) => {
		const overlay = document.createElement("div");
		overlay.className = "modal-overlay";
		overlay.innerHTML = `
            <div class="modal-content">
                <h2>You Won!</h2>
                <p>Bad News! <strong>${username}</strong> didnt want to play with you anymore.</p>
                <button id="modal-home-btn" class="modal-btn">Back To Start</button>
            </div>
        `;
		document.body.appendChild(overlay);

		const btn = overlay.querySelector("#modal-home-btn");
		btn?.addEventListener("click", () => {
			overlay.remove();
			onConfirm();
		});
	};

	// --- TIMER FUNKTIONER ---
	const tick = () => {
		const timeElapsed = Date.now() - timerStartedAt;
		const latestTickTime = (timeElapsed / 1000).toFixed(2) + "s";
		const myClock = container.querySelector("#myStopWatch") as HTMLElement;
		const oppClock = container.querySelector(
			"#opponentStopWatch",
		) as HTMLElement;
		if (myTimer && myClock) myClock.innerText = latestTickTime;
		if (opponentTimer && oppClock) oppClock.innerText = latestTickTime;
	};

	const startMyTimer = () => {
		stopMyTimer();
		myTimer = setInterval(tick, 10);
	};
	const startOpponentTimer = () => {
		stopOpponentTimer();
		opponentTimer = setInterval(tick, 10);
	};
	const stopMyTimer = () => {
		if (myTimer) {
			clearInterval(myTimer);
			myTimer = null;
		}
	};
	const stopOpponentTimer = () => {
		if (opponentTimer) {
			clearInterval(opponentTimer);
			opponentTimer = null;
		}
	};

	//  Hantera Rage Quit
	socket.on("playerRageQuit", (username) => {
		stopMyTimer();
		stopOpponentTimer();

		// Göm viruset om det är synligt
		if (virusElement) virusElement.style.display = "none";

		//Visa ragequit modal
		showRageQuitModal(username, () => {
			goToFirstPage();
		});
	});

	socket.on("playersInRoom", (players: Player[]) => {
    const playerTimerEl = container.querySelector("#playerTimers");
    if (playerTimerEl && players.length > 0) {
        currentGameRoomId = players[0].gameRoomId;
        playerTimerEl.innerHTML = players
            .map((player, index) => {
                const isMe = player.id === socket.id;
                if (isMe) {
                    myName = player.username;
                    iAmP1 = index === 0;
                } else {
                    opponentName = player.username;
                }
                const timerId = isMe ? "myStopWatch" : "opponentStopWatch";
                return `
                    <div class="player-box">
                        <span class="player-name">${isMe ? player.username + " (Du)" : player.username}:</span>
                        <span id="${timerId}" class="timer">0.00s</span>
                    </div>`;
            })
            .join("");

        const scoreEl = container.querySelector(".scores");
        if (scoreEl) {
            scoreEl.textContent = `${myName}: 0 | ${opponentName}: 0`;
        }
    }
});

	//Visa spelarnas poäng i gameRoom
	socket.on("showScores", (p1, p2) => {
		const scoreEl = container.querySelector(".scores");
		const myScore = iAmP1 ? p1 : p2;
		const opponentScore = iAmP1 ? p2 : p1;
		if (scoreEl)
			scoreEl.textContent = `${myName}: ${myScore} | ${opponentName}: ${opponentScore}`;
	});

	// NEDRÄKNINGS-LOGIK
	let gameReady = false;
	let pendingVirus: (() => void) | null = null;
	const overlay = container.querySelector(
		"#countdown-overlay",
	) as HTMLElement;
	const countdownNumber = container.querySelector(
		"#countdown-number",
	) as HTMLElement;
	const steps = ["3", "2", "1", "GO!"];
	let stepIndex = 0;

	const runCountdown = () => {
		countdownNumber.textContent = steps[stepIndex];
		countdownNumber.style.transform = "scale(1.3)";
		countdownNumber.style.opacity = "1";
		setTimeout(() => {
			countdownNumber.style.transform = "scale(1)";
			countdownNumber.style.opacity = "0.7";
		}, 150);
		stepIndex++;
		if (stepIndex < steps.length) {
			setTimeout(runCountdown, 1000);
		} else {
			setTimeout(() => {
				overlay.style.display = "none";
				gameReady = true;
				if (pendingVirus) {
					pendingVirus();
					pendingVirus = null;
				}
			}, 600);
		}
	};
	setTimeout(runCountdown, 200);

	const handleVirusClick = () => {
		if (virusElement.style.display === "none") return;
		const reactionTime = Date.now() - timerStartedAt;
		stopMyTimer();
		const myClock = container.querySelector("#myStopWatch");
		if (myClock)
			myClock.textContent = `${(reactionTime / 1000).toFixed(2)}s`;
		if (currentGameRoomId)
			socket.emit("virusClicked", reactionTime, currentGameRoomId);
		virusElement.style.display = "none";
	};
	virusElement.addEventListener("click", handleVirusClick);

	const showVirus = (virus: { positionX: number; positionY: number }) => {
		const cells = container.querySelectorAll(".grid-cell");
		const cell = cells[
			virus.positionY * 10 + virus.positionX
		] as HTMLElement;
		if (cell && virusElement) {
			const oppClock = container.querySelector("#opponentStopWatch");
			const myClock = container.querySelector("#myStopWatch");
			if (oppClock && myClock) {
				oppClock.textContent = "0.00s";
				myClock.textContent = "0.00s";
			}
			cell.appendChild(virusElement);
			virusElement.style.animation = "none";
			void virusElement.offsetHeight;
			virusElement.style.animation = "";
			virusElement.style.display = "flex";

			timerStartedAt = Date.now();
			startMyTimer();
			startOpponentTimer();
		}
	};

	socket.on("virusPositionsAndTime", (virus) => {
		round++;
		if (round > 10) return;
		if (gameReady) showVirus(virus);
		else pendingVirus = () => showVirus(virus);
	});

	socket.on("stopTimer", () => {
		stopOpponentTimer();
	});

	socket.on("showOpponentTimer", (officialTime: number) => {
		const formattedTime = (officialTime / 1000).toFixed(2) + "s";
		const oppClock = container.querySelector(
			"#opponentStopWatch",
		) as HTMLElement;
		if (oppClock) oppClock.textContent = formattedTime;
	});

	socket.on("currentGameResult", (p1, p2) => {
		stopMyTimer();
		stopOpponentTimer();
		socket.off("playersInRoom");
		socket.off("showScores");
		socket.off("stopTimer");
		socket.off("playerRageQuit");
		socket.off("virusPositionsAndTime");
		socket.off("currentGameResult");
		virusElement.removeEventListener("click", handleVirusClick);

		const winnerPage = createWinnerPage(
			p1,
			p2,
			goToWaitingRoom,
			goToFirstPage,
		);
		const appContainer = document.querySelector("#app") || document.body;
		appContainer.innerHTML = "";
		appContainer.appendChild(winnerPage);
	});

	return container;
}
