import { createFirstPage } from "./firstPage";
import { io } from "socket.io-client";
import { createGamePage } from "./gamePage";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
	console.log("Connected to backend! Socket ID:", socket.id);
})


export function createWaitingRoom(
	nickname: string,
	goToFirstPage: () => void,
	goToGamePage: () => void
): HTMLElement {
	const container = document.createElement("section");
	container.className = "waiting-room";

	const wrapper = document.createElement("div");
	wrapper.className = "waiting-wrapper";

	//När backend säger att 2 spelare är redo, gå till spelsidan
	socket.on("startGameCountDown", () => {
		console.log("2 spelare redo! Navigerar till gamePage");
		goToGamePage();

	})

	//Titel
	const waitingText = document.createElement("h2");
	waitingText.className = "waiting-text";
	waitingText.textContent = "Waiting for other player";

	//Span för animation av punkterna
	const dotsSpan = document.createElement("span");
	dotsSpan.className = "dots";
	waitingText.appendChild(dotsSpan);

	wrapper.appendChild(waitingText);

	//JS-animation för punkterna
	let dots = 0;
	setInterval(() => {
		dots = (dots + 1) % 4; //Loops 0,1,2,3
		dotsSpan.textContent = ".".repeat(dots);
	}, 500);

	//Visa nickname
	const playerName = document.createElement("p");
	playerName.textContent = `Your nickname:  ${nickname}`;
	wrapper.appendChild(playerName);

	container.appendChild(wrapper);

	//Exit knapp
	const exitButton = document.createElement("button");
	exitButton.textContent = "Exit";
	exitButton.className ="exit-button";
	exitButton.onclick = () => goToFirstPage();
	container.appendChild(exitButton);
	return container;

}


