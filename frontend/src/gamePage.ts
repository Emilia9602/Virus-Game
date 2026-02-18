export function createGamePage(nickname: string): HTMLElement {
    console.log("LOG 15: createGamePage() called for:", nickname);

    const container = document.createElement("section");
    container.className = "game-page";

    container.innerHTML = `
        <div class="game-ui">
            <h2>Welcome, ${nickname}!</h2>
            <div class="game-status">Waiting for virus...</div>
            <div class="scores">You: 0 | Opponent: 0</div>
        </div>

        <div class="game-board-wrapper" style="width: 600px; height: 600px; margin: 0 auto; border: 5px solid #333;">
            <div id="game-area" class="gridSystem">
                <div id="virus" class="virus-target" style="display: none; cursor: pointer; font-size: 2rem; display: flex; align-items: center; justify-content: center;">
                    🦠
                </div>
            </div>
        </div>
    `;

    console.log("LOG 15.1: Grid structure created with innerHTML and .gridSystem");
    return container;
}
