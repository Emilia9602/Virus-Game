export function createFirstPage(onStart: (nickname: string) => void): HTMLElement {
	const container = document.createElement("section")
	container.className ="first-page"

	const contentWrapper = document.createElement("div");
	contentWrapper.className = "content-wrapper";

	const logo = document.createElement("img");
	logo.src = "/virushero.jpg";
	logo.alt = "Game Logo";
	logo.className = "game-logo";

	const input = document.createElement("input")
	input.placeholder = "Enter nickname"
	input.maxLength = 16
	input.className = "nickname-input"

	input.id ="nickname";
	input.name = "nickname";

	const button = document.createElement("button")
	button.textContent = "Start Game"
	button.className ="start-button"

	button.onclick = () => {
		const name = input.value.trim()
		if (!name) return alert("Please enter a nickname!")
			onStart(name)
	};

	const statsWrapper = document.createElement("div");
	statsWrapper.className ="stats-wrapper";

	//Kort 1: Senaste matcherna
	const historyCard = document.createElement("div");
	historyCard.className = "stats-card";

	const historyTitle = document.createElement("h3");
	historyTitle.textContent = "Recent Matches";

	const historyList = document.createElement("ul");
	historyList.id = "history-list";
	historyList.className = "stats-list";

	historyCard.append(historyTitle, historyList);

	//Kort 2: Aktiva spel
	const activeCard = document.createElement("div");
	activeCard.className = "stats-card";

	const activeTitle = document.createElement("h3");
	activeTitle.textContent ="Active Games";

	const activeCount = document.createElement("p");
	activeCount.id = "active-games-count";
	activeCount.className = "stats-count";
	activeCount.textContent = "0";

	activeCard.append(activeTitle, activeCount);

	//Lägg till korten i wrappern
	statsWrapper.append(historyCard, activeCard);

	contentWrapper.append(logo, input, button, statsWrapper);
	container.append(contentWrapper);
	return container
}
