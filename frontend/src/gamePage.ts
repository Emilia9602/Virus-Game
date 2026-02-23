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
            <h2>Welcome ${nickname}!</h2>
            <div class="game-status">Waiting for virus...</div>
            <div id="playerTimers" class="timer-container" style="display: flex; gap: 20px; justify-content: center; margin-bottom: 10px;"></div>
            <div class="scores"></div>
        </div>

        <div class="game-board-wrapper" style="width: 600px; height: 600px; margin: 0 auto; border: 5px solid #333; position: relative;">
            <div id="game-area" class="gridSystem"></div>
            <div id="virus" class="virus-target" style="display: none; cursor: pointer; font-size: 2rem; position: absolute; z-index: 10;">🦠</div>

            <div id="countdown-overlay" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.75); display: flex; align-items: center; justify-content: center; z-index: 100; border-radius: 4px;">
                <span id="countdown-number" style="font-size: 8rem; font-weight: bold; color: #fff; font-family: monospace; text-shadow: 0 0 30px rgba(255,255,255,0.6);">3</span>
            </div>
        </div>
    `;

    // Skapa grid
    const gameArea = container.querySelector("#game-area") as HTMLElement;
    if (gameArea) {
        let cellsHTML = "";
        for (let i = 0; i < 100; i++) { cellsHTML += '<div class="grid-cell"></div>'; }
        gameArea.innerHTML = cellsHTML;
    }

    // Nedräknings-logik
    let gameReady = false;
    let pendingVirus: (() => void) | null = null;
    const overlay = container.querySelector("#countdown-overlay") as HTMLElement;
    const countdownNumber = container.querySelector("#countdown-number") as HTMLElement;
    const steps = ["3", "2", "1", "GO!"];
    let stepIndex = 0;

    const runCountdown = () => {
        countdownNumber.textContent = steps[stepIndex];
        // Liten pop-animation på varje steg
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
            // Nedräkning klar, dölj overlay och starta spelet
            setTimeout(() => {
                overlay.style.display = "none";
                gameReady = true;
                if (pendingVirus) { pendingVirus(); pendingVirus = null; }
            }, 600);
        }
    };
    setTimeout(runCountdown, 200);

    // Socket lyssnare
    socket.on("playersInRoom", (players: Player[]) => {
        const playerTimerEl = container.querySelector("#playerTimers");
        if (playerTimerEl && players.length > 0) {
            // Sparar rumId så virusklick kan skickas till rätt rum
            currentGameRoomId = players[0].gameRoomId;
            playerTimerEl.innerHTML = players.map((player, index) => {
                const isMe = player.id === socket.id;
				if (isMe) { myName = player.username;
				iAmP1 = index === 0;
			} else opponentName = player.username;
                const timerId = isMe ? "myStopWatch" : "opponentStopWatch";
                return `<div class="player-box"><span>${isMe ? player.username + " (Du)" : player.username}</span><span id="${timerId}" style="font-family: monospace; font-weight: bold;">0.00s</span></div>`;
            }).join("");

			const scoreEl = container.querySelector(".scores");
			if (scoreEl) scoreEl.textContent = `${myName}: 0 | ${opponentName}: 0`;

        }
    });

    socket.on("showScores", (p1, p2) => {
        const scoreEl = container.querySelector(".scores");
		const myScore = iAmP1 ? p1 : p2;
		const opponentScore = iAmP1 ? p2 : p1;
        if (scoreEl) scoreEl.textContent = `${myName}: ${myScore} | ${opponentName}: ${opponentScore}`;
    });

    socket.on("playerRageQuit", (username) => {
        alert(`${username} lämnade spelet!`);
        window.location.reload();
    });

    // Timer funktioner
    const tick = () => {
        const timeElapsed = Date.now() - timerStartedAt;
        const latestTickTime = (timeElapsed / 1000).toFixed(2) + "s";
        const myClock = container.querySelector("#myStopWatch") as HTMLElement;
        const oppClock = container.querySelector("#opponentStopWatch") as HTMLElement;
        if (myTimer && myClock) myClock.innerText = latestTickTime;
        if (opponentTimer && oppClock) oppClock.innerText = latestTickTime;
    };

    const startMyTimer = () => { stopMyTimer(); myTimer = setInterval(tick, 10); };
    const startOpponentTimer = () => { stopOpponentTimer(); opponentTimer = setInterval(tick, 10); };
    const stopMyTimer = () => { if (myTimer) { clearInterval(myTimer); myTimer = null; } };
    const stopOpponentTimer = () => { if (opponentTimer) { clearInterval(opponentTimer); opponentTimer = null; } };

    const virusElement = container.querySelector("#virus") as HTMLElement;

    // Registreras en gång och hanterar klick, reaktionstid och socket-emit
    const handleVirusClick = () => {
        if (virusElement.style.display === "none") return;
        const reactionTime = Date.now() - timerStartedAt;
        stopMyTimer();
        const myClock = container.querySelector("#myStopWatch");
        if (myClock) myClock.textContent = `${(reactionTime / 1000).toFixed(2)}s`;
        if (currentGameRoomId) socket.emit("virusClicked", reactionTime, currentGameRoomId);
        virusElement.style.display = "none";
    };
    virusElement.addEventListener("click", handleVirusClick);

    // Placerar viruset i rätt cell och startar klockorna
    const showVirus = (virus: { positionX: number; positionY: number }) => {
        const cells = container.querySelectorAll(".grid-cell");
        const cell = cells[virus.positionY * 10 + virus.positionX] as HTMLElement;
        if (cell && virusElement) {
            // Nollställer klockorna innan ny runda visas
            const oppClock = container.querySelector("#opponentStopWatch");
            const myClock = container.querySelector("#myStopWatch");
            if (oppClock && myClock) { oppClock.textContent = "0.00s"; myClock.textContent = "0.00s"; }
            cell.appendChild(virusElement);
			//Startar om pulse-animationen varje gång viruset visas
			virusElement.style.animation = "none";
			virusElement.offsetHeight;
			virusElement.style.animation = "";

			virusElement.style.display = "flex";

            // Båda klockor startar exakt när viruset visas
            timerStartedAt = Date.now();
            startMyTimer();
            startOpponentTimer();
        }
    };

    socket.on("virusPositionsAndTime", (virus) => {
        round++;
        if (round > 10) return;
        // Om nedräkning pågår köas viruset tills den är klar
        if (gameReady) showVirus(virus);
        else pendingVirus = () => showVirus(virus);
    });

    // Fryser rätt klocka beroende på vem som klickade
    socket.on("stopTimer", (isMe) => {
        if (isMe) stopMyTimer(); else stopOpponentTimer();
    });

    socket.on("currentGameResult", (p1, p2) => {
        stopMyTimer();
        stopOpponentTimer();
        // rensar alla lyssnare så de inte staplas vid omspel
        socket.off("playersInRoom");
        socket.off("showScores");
        socket.off("stopTimer");
        socket.off("playerRageQuit");
        socket.off("virusPositionsAndTime");
        socket.off("currentGameResult");
        virusElement.removeEventListener("click", handleVirusClick);

        const winnerPage = createWinnerPage(p1, p2, goToWaitingRoom, goToFirstPage);
        const appContainer = document.querySelector("#app") || document.body;
        appContainer.innerHTML = "";
        appContainer.appendChild(winnerPage);
    });

    return container;
}