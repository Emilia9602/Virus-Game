import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";
import "./assets/scss/style.scss";
import { createFirstPage } from "./firstPage";
const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("🙇 Connecting to Socket.IO Server at:", SOCKET_HOST);


// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);

/**
 * DOM References
 */
const app = document.querySelector<HTMLDivElement>("#app")!;

/**
 * Variables
 */

/**
 * Functions
 */
const handleStartGame =(nickname: string) => {
	console.log("Player joined with nickname:", nickname);
};

const renderLobby = () => {
	app.innerHTML = "";

	app.appendChild(createFirstPage(handleStartGame));

};

//Listen for when a connection is established
renderLobby();
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
