import type {
	ClientToServerEvents,
	GameResult,
	ServerToClientEvents,
	ShowLiveScore,
} from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";
import "./assets/scss/style.scss";
import { createFirstPage } from "./firstPage";
import { createWaitingRoom } from "./waitingRoom";
import { createGamePage } from "./gamePage";

console.log("LOG 1: main.ts loaded");

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("LOG 2: Connecting to:", SOCKET_HOST);

// global variabel
let latestGamesState: GameResult[]=[];
let liveGamesState: ShowLiveScore[] = [];



const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
	io(SOCKET_HOST);

socket.on("countDown", (num) => {
	console.log("LOG 12: Socket countDown received:", num);
});

const app = document.querySelector<HTMLDivElement>("#app")!;
console.log("LOG 3: #app element found:", !!app);


// Uppdatera antal aktiva spel
socket.on("showLiveScore", (gamesInProgress) => {
	liveGamesState = gamesInProgress;
    renderLiveScores();

});



	const renderLiveScores = ()=>{
		const activeCountEl = document.querySelector("#active-games-count");
		const liveDetailsEl = document.querySelector("#live-games-details");

		// Uppdatera räknaren om den finns
    if (activeCountEl) {
        activeCountEl.textContent = liveGamesState.length.toString();
    }

    // Uppdatera listan om den finns
    if (liveDetailsEl) {
        if (liveGamesState.length === 0) {
            liveDetailsEl.innerHTML = `<li>No games currently active</li>`;
            return;
        }

		liveDetailsEl.innerHTML = liveGamesState
			.map((game) => {
				const p1 = game.players[0]?.username || "Waiting...";
				const p2 = game.players[1]?.username || "Waiting...";
				const round = game.gameRound ?? 0;
				return `<li>${p1} vs ${p2} <br><small>Round: ${round}/10</small></li>`;
			})
			.join("");
	}
}


socket.on("showRecentGames", (games) => {
    latestGamesState = games;
    renderHistoryList();
});

function renderHistoryList() {
    const historyListEl = document.querySelector("#history-list");
    if (!historyListEl) return;

    if (latestGamesState.length === 0) {
        historyListEl.innerHTML = `<li class="loading-msg">No recent matches</li>`;
        return;
    }

    historyListEl.innerHTML = latestGamesState
        .map((game) => {
            const isDraw = game.player1Score === game.player2Score;
            const winner = game.player1Score > game.player2Score
                ? game.player1UserName
                : game.player2UserName;

            return `
                <li class="history-item">
                    <div class="history-players">
                        <strong>${game.player1UserName}</strong> vs <strong>${game.player2UserName}</strong>
                    </div>
                    <div class="history-score">
                        ${game.player1Score} - ${game.player2Score}
                    </div>
                    <small class="history-winner">
                        ${isDraw ? "Draw" : `Winner: ${winner}`}
                    </small>
                </li>`;
        })
        .join("");
}

socket.on("connect", () => {
	console.log("LOG 0: Socket connected. ID:", socket.id);
});

function showFirstPage() {
	console.log("LOG 4: showFirstPage triggered");
	app.innerHTML = "";
	const firstPage = createFirstPage((nickname) => {
		console.log("LOG 6: FirstPage callback received nickname:", nickname);
		showWaitingRoom(nickname);
	});
	console.log("LOG 5: Appending firstPage to DOM");
	app.appendChild(firstPage);

	renderHistoryList();
	renderLiveScores();
}

function showWaitingRoom(nickname: string) {
	console.log("LOG 7: showWaitingRoom triggered for:", nickname);
	app.innerHTML = "";
	const waitingRoom = createWaitingRoom(
		nickname,
		socket,
		() => {
			console.log("LOG EXIT: Returning to First Page");
			showFirstPage();
		},
		() => {
			console.log(
				"LOG 13: WaitingRoom callback 'goToGamePage' triggered",
			);
			showGamePage(nickname);
		},
	);
	console.log("LOG 10: Appending waitingRoom to DOM");
	app.appendChild(waitingRoom);
}

function showGamePage(nickname: string) {
	console.log("LOG 14: showGamePage triggered for:", nickname);
	app.innerHTML = "";
	const gamePage = createGamePage(
		nickname,
		socket,
		() => showWaitingRoom(nickname), //skickar med funktionen för YES
		showFirstPage, //Skickar med funktionen för NO
	);
	console.log("LOG 16: Appending gamePage to DOM");
	app.appendChild(gamePage);
}

showFirstPage();
