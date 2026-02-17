import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";
import "./assets/scss/style.scss";
import { createFirstPage } from "./firstPage";
import { createWaitingRoom } from "./waitingRoom";
import { createGamePage } from "./gamePage"

let currentNickname = "";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);

socket.on("countDown", (num) => {
	console.log("Countdown:", num);
});
// socket.on("startGameCountDown", () => {
// 	console.log("Spelet startar nu!");
// 	app.innerHTML = "";
// 	const gamePage = createGamePage(currentNickname);
// 	app.appendChild(gamePage);
// });

//DOM References
const app = document.querySelector<HTMLDivElement>("#app")!;

//Functions
function showFirstPage() {
	app.innerHTML = "";
	const firstPage = createFirstPage((nickname) => {
		currentNickname = nickname;
		showWaitingRoom(nickname);
	});
	app.appendChild(firstPage);
}

function showWaitingRoom(nickname: string) {
	app.innerHTML = "";
	const waitingRoom = createWaitingRoom(
		nickname,
		socket,
		() => showFirstPage(),
		() => {
			app.innerHTML = "";
			const gamePage = createGamePage(nickname);
			app.appendChild(gamePage);
		}
	);
	app.appendChild(waitingRoom);
}
showFirstPage();

//Listen for when a connection is established
socket.on("connect", () => {
	console.log("💥Connected to server", socket.io.opts.hostname + ":" + socket.io.opts.port);
	console.log("Socket ID:", socket.id);
});

socket.on("disconnect", () => {
	console.log("🥺Got disconnected from server", socket.io.opts.hostname + ":" + socket.io.opts.port);

});

socket.io.on("reconnect", () => {
	console.log ("🥰 Reconnected to server:", socket.io.opts.hostname + ":" + socket.io.opts.port);
});

/**
 * DOM Event Listeners
 */


