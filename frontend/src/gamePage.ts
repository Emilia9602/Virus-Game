export function createGamePage(nickname: string): HTMLElement {
	const container = document.createElement("section");
	container.className = "game-page";

	const title = document.createElement("h2");
	title.textContent = `Welcome to the game, ${nickname}!`;

	//Lägg till spelstatus
	const status = document.createElement("div");
	status.className = "game-status";
	status.textContent = "Waiting for opponent...";

	//Lägg till poängvisning
	const scores = document.createElement("div");
	scores.className = "scores";
	scores.textContent = "Scores will appear here";

	container.appendChild(title);
	container.appendChild(status);
	container.appendChild(scores);

	return container;
}