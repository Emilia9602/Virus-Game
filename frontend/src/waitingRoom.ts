import { createFirstPage } from "./firstPage";

export function createWaitingRoom(
	nickname: string,
	goToFirstPage: () => void
): HTMLElement {
	const container = document.createElement("section");
	container.className = "waiting-room";

	const wrapper = document.createElement("div");
	wrapper.className = "waiting-wrapper";

	//Title
	const title = document.createElement("h2");
	title.textContent = "Waiting Room";
	wrapper.appendChild(title);

	//Show nickname
	const playerName = document.createElement("p");
	playerName.textContent = `Your nickname:  ${nickname}`;
	wrapper.appendChild(playerName);

	//Placeholder for player list
	const playersList = document.createElement("ul");
	playersList.id = "players-list";
	playersList.textContent = "Waiting for other players...";
	wrapper.appendChild(playersList);

	//Exit button
	const exitButton = document.createElement("button");
	exitButton.textContent = "Exit";
	exitButton.className = "exit-button";
	exitButton.onclick = () => {
		goToFirstPage();
	};
	wrapper.appendChild(exitButton);
	container.appendChild(wrapper);
	return container;

}


