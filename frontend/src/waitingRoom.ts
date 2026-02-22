import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";

export function createWaitingRoom(
	nickname: string,
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	goToFirstPage: () => void,
	goToGamePage: () => void
): HTMLElement {
	console.log("LOG 8: createWaitingRoom() called for:", nickname);

	const container = document.createElement("section");
	container.className = "waiting-room";

	const wrapper = document.createElement("div");
	wrapper.className = "waiting-wrapper";

	// Titel
	const waitingText = document.createElement("h2");
	waitingText.className = "waiting-text";
	waitingText.textContent = "Waiting for other player";

	// Span för animation av punkterna
	const dotsSpan = document.createElement("span");
	dotsSpan.className = "dots";
	waitingText.appendChild(dotsSpan);
	wrapper.appendChild(waitingText);

	// JS animation för punkterna
	let dots = 0;
	const dotsInterval = setInterval(() => {
		dots = (dots + 1) % 4;
		dotsSpan.textContent = ".".repeat(dots);
	}, 500);

	// En ny div för att visa den stora nedräkningen (3, 2, 1)
	const countdownDisplay = document.createElement("div");
	countdownDisplay.className = "countdown-number";
	countdownDisplay.style.fontSize = "4rem";
	countdownDisplay.style.fontWeight = "bold";
	wrapper.appendChild(countdownDisplay);

	/**
	 * GUARD: Säkerställer att goToGamePage() bara anropas EN gång,
	 * oavsett om startGame och countDown(0) båda triggas nära inpå varandra.
	 */
	let hasNavigated = false;

	const navigateToGame = () => {
		if (hasNavigated) return;
		hasNavigated = true;

		clearInterval(dotsInterval);
		socket.off("startGame");
		socket.off("countDown");

		console.log("LOG 11.1: Navigating to game page");
		goToGamePage();
	};

	// --- SOCKET LOGIK ---
	console.log("LOG 9: Emitting playerJoinRequest");
	socket.emit("playerJoinRequest", nickname, (response: { success: boolean; gameRoomId: string }) => {
		console.log("LOG 9.1: Join response from server:", response);
	});

	/**
	 * När backend säger att 2 spelare är redo navigerar vi DIREKT.
	 * Servern börjar skicka virusPositionsAndTime direkt efter startGame,
	 * så vi får inte vänta annars missar vi de första viruseventen.
	 */
	socket.on("startGame", () => {
		console.log("LOG 11: startGame event received – navigating immediately");
		waitingText.textContent = "Game starts in...";
		dotsSpan.textContent = "";
		navigateToGame();
	});

	// Lyssna på siffrorna (3, 2, 1, 0) – guard stoppar dubbelnavigering
	socket.on("countDown", (num) => {
		console.log("LOG 12.1: countDown event received, value:", num);
		countdownDisplay.textContent = num.toString();

		if (num === 0) {
			console.log("LOG 12.2: Countdown reached 0 – navigating");
			navigateToGame();
		}
	});

	// Visa nickname
	const playerName = document.createElement("p");
	playerName.textContent = `Your nickname: ${nickname}`;
	wrapper.appendChild(playerName);
	container.appendChild(wrapper);

	// Exit knapp
	const exitButton = document.createElement("button");
	exitButton.textContent = "Exit";
	exitButton.className = "exit-button";
	exitButton.onclick = () => {
		console.log("LOG EXIT: User clicked exit button");
		clearInterval(dotsInterval);
		socket.off("startGame");
		socket.off("countDown");
		goToFirstPage();
	};
	container.appendChild(exitButton);

	return container;
}