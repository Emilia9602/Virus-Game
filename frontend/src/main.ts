import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from "@shared/types/SocketEvents.types.ts";
import { io, Socket } from "socket.io-client";
import "./assets/scss/style.scss";
import { createFirstPage } from "./firstPage";
import { createWaitingRoom } from "./waitingRoom";
import { createGamePage } from "./gamePage"

console.log("LOG 1: main.ts loaded");

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST;
console.log("LOG 2: Connecting to:", SOCKET_HOST);

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);

socket.on("countDown", (num) => {
    console.log("LOG 12: Socket countDown received:", num);
});

const app = document.querySelector<HTMLDivElement>("#app")!;
console.log("LOG 3: #app element found:", !!app);

function showFirstPage() {
    console.log("LOG 4: showFirstPage triggered");
    app.innerHTML = "";
    const firstPage = createFirstPage((nickname) => {
        console.log("LOG 6: FirstPage callback received nickname:", nickname);
        showWaitingRoom(nickname);
    });
    console.log("LOG 5: Appending firstPage to DOM");
    app.appendChild(firstPage);
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
            console.log("LOG 13: WaitingRoom callback 'goToGamePage' triggered");
            showGamePage(nickname);
        }
    );
    console.log("LOG 10: Appending waitingRoom to DOM");
    app.appendChild(waitingRoom);
}

socket.on("connect", () => {
    console.log("LOG 0: Socket connected. ID:", socket.id);
});


function showGamePage(nickname: string) {
    console.log("LOG 14: showGamePage triggered for:", nickname);
    app.innerHTML = "";
    const gamePage = createGamePage(
		nickname,
		socket,
	);
    console.log("LOG 16: Appending gamePage to DOM");
    app.appendChild(gamePage);
}




showFirstPage();
