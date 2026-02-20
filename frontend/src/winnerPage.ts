import type { Player } from "../../backend/generated/prisma/client.ts";

export function createWinnerPage(player1: Player, player2: Player): HTMLElement {
    const container = document.createElement("section");
    container.className = "winner-page";

    // Räkna ut vem som vann
    let resultTitle = "";
    if (player1.score > player2.score) {
        resultTitle = `${player1.username} Wins! 🏆`;
    } else if (player2.score > player1.score) {
        resultTitle = `${player2.username} Wins! 🏆`;
    } else {
        resultTitle = "It's a Draw! 🤝";
    }

    container.innerHTML = `
        <div class="winner-container" style="text-align: center; padding: 50px;">
            <h1>Game Over</h1>
            <h2 class="result-title">${resultTitle}</h2>

            <div class="final-scores" style="margin: 30px 0; font-size: 1.5rem;">
                <p>${player1.username}: <strong>${player1.score}</strong></p>
                <p>${player2.username}: <strong>${player2.score}</strong></p>
            </div>

            <button id="playAgain" class="btn-play-again">Play Again</button>
        </div>
    `;

    // Knapp för att starta om (ladda om sidan är det enklaste sättet att nollställa socket-state)
    container.querySelector("#playAgain")?.addEventListener("click", () => {
        window.location.reload();
    });

    return container;
}
