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

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("Connecting to:", SOCKET_HOST);

// global variabel
let latestGamesState: GameResult[] = [];
let liveGamesState: ShowLiveScore[] = [];

const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
	io(SOCKET_HOST);

const app = document.querySelector<HTMLDivElement>("#app")!;

// Uppdatera antal aktiva spel
socket.on("showLiveScore", (gamesInProgress) => {
	liveGamesState = gamesInProgress;
	renderLiveScores();
});

const renderLiveScores = () => {
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
				return `<li>${p1} vs ${p2} <br><small>${round}/10</small></li>`;
			})
			.join("");
	}
};

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
			return `
                <li class="history-item">
                    <div class="history-players">
                        <strong>${game.player1UserName}</strong> vs <strong>${game.player2UserName}</strong>
                    </div>
                    <div class="history-score">
                        ${game.player1Score} - ${game.player2Score}
                    </div>

                </li>`;
		})
		.join("");
}

socket.on("connect", () => {});

//Visa första sidan
function showFirstPage() {
	app.innerHTML = "";
	const firstPage = createFirstPage((nickname) => {
		showWaitingRoom(nickname);
	});
	app.appendChild(firstPage);

	renderHistoryList();
	renderLiveScores();
}

//Visa sidan när man väntar på en annan spelare
function showWaitingRoom(nickname: string) {
	app.innerHTML = "";
	const waitingRoom = createWaitingRoom(
		nickname,
		socket,
		() => {
			showFirstPage();
		},
		() => {
			showGamePage(nickname);
		},
	);
	app.appendChild(waitingRoom);
}

//Visa spelsidan
function showGamePage(nickname: string) {
	app.innerHTML = "";
	const gamePage = createGamePage(
		nickname,
		socket,
		() => showWaitingRoom(nickname), //skickar med funktionen för YES
		showFirstPage, //Skickar med funktionen för NO
	);
	app.appendChild(gamePage);
}

showFirstPage();
