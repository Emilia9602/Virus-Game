import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";
import "./assets/scss/style.scss";
import { createFirstPage } from "./firstPage";
import { createWaitingRoom } from "./waitingRoom";

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);

//DOM References
const app = document.querySelector<HTMLDivElement>("#app")!;
const waitingRoomElement = document.getElementById(
	"waitingRoom",
) as HTMLDivElement;
const gameRoomViewElement = document.querySelector(
	".gameRoomView",
) as HTMLDivElement;

// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
	io(SOCKET_HOST);

let firstPageElement: HTMLElement | null = null;

/**
 * Functions
 */

/**
 * SHOW FIRST PAGE
 */
function showFirstPage() {
	firstPageElement = createFirstPage((nickname) => {
		joinGame(nickname);
	});

	app.prepend(firstPageElement);
}

/**
 * PLAYER JOINS GAME
 */
function joinGame(nickname: string) {
	console.log("🎮 Nickname:", nickname);

	// skicka till servern (KORREKT EVENT)
	socket.emit("playerJoinRequest", nickname, (response) => {
		console.log("Server response:", response);
	});

	// ta bort startskärmen
	if (firstPageElement) {
		firstPageElement.remove();
	}

	showWaitingRoom(nickname);
}

/**
 * SHOW WAITING ROOM
 */
function showWaitingRoom(nickname: string) {
	waitingRoomElement.classList.remove("hide");
	gameRoomViewElement.classList.add("hide");

	// om du använder createWaitingRoom:
	waitingRoomElement.innerHTML = "";
	waitingRoomElement.appendChild(createWaitingRoom(nickname, showFirstPage));
}

/**
 * SHOW GAME ROOM
 */
function showGameRoom() {
	waitingRoomElement.classList.add("hide");
	gameRoomViewElement.classList.remove("hide");
}

//Listen for when a connection is established
socket.on("connect", () => {
	console.log(
		"💥Connected to server",
		socket.io.opts.hostname + ":" + socket.io.opts.port,
	);
	console.log("Socket ID:", socket.id);
});

socket.on("disconnect", () => {
	console.log(
		"🥺Got disconnected from server",
		socket.io.opts.hostname + ":" + socket.io.opts.port,
	);
});

socket.io.on("reconnect", () => {
	console.log(
		" Reconnected to server:",
		socket.io.opts.hostname + ":" + socket.io.opts.port,
	);
});

/**
 * DOM Event Listeners
 */

/**
 * Socket Event Listeners
 */

// servern säger starta spel
socket.on("startGameCountdown", () => {
	console.log("Game starting!");
	showGameRoom();
});

/**
 * Socket handlers
 */

/**
 * START APP
 */
showFirstPage();
