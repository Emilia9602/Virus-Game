export function createFirstPage(
	onStart: (nickname: string) => void,
): HTMLElement {
	const container = document.createElement("section");
	container.className = "first-page";

	container.innerHTML = `
        <div class="content-wrapper">
            <img src="/virushero.jpg" alt="Game Logo" class="game-logo">

            <div class="instructions-wrapper">
                <button class="instructions-button">How to Play</button>
            </div>

         <div class="instructions-box" style="display: none;">
   			<button class="close-instructions">&times;</button>
   			<h3>How to Play:</h3>
   			<p>Click the virus as fast as possible.</p>
   			<p>The fastest player gets the point.</p>
   			<p>The player with most points wins.</p>
			</div>

            <input type="text" placeholder="Enter nickname" maxlength="16" class="nickname-input" id="nickname">

            <div class="button-wrapper">
                <button class="start-button">Start Game</button>
            </div>

            <div class="stats-wrapper">
                <div class="stats-card">
                    <h3>Recent Games</h3>
                    <div class="table-header">
                        <span>Players</span>
                        <span>Result</span>
                    </div>
                    <ul id="history-list" class="stats-list">
                        <li class="loading-msg">No recent games</li>
                    </ul>
                </div>

                <div class="stats-card">
                    <h3>Active Games</h3>
                    <div class="table-header">
                        <span>Players</span>
                        <span>Round</span>
                    </div>
                    <ul id="live-games-details" class="stats-list">
                    </ul>
                </div>
            </div>
        </div>
    `;

	const input = container.querySelector("#nickname") as HTMLInputElement;
	const startBtn = container.querySelector(
		".start-button",
	) as HTMLButtonElement;
	const instructionsBtn = container.querySelector(
		".instructions-button",
	) as HTMLButtonElement;
	const instructionsBox = container.querySelector(
		".instructions-box",
	) as HTMLElement;

	startBtn.onclick = () => {
		const name = input.value.trim();
		if (!name) return alert("Please enter a nickname!");
		onStart(name);
	};

	const closeX = container.querySelector(
		".close-instructions",
	) as HTMLButtonElement;

	instructionsBtn.onclick = () => {
		instructionsBox.style.display = "block";
	};

	closeX.onclick = () => {
		instructionsBox.style.display = "none";
	};

	return container;
}
