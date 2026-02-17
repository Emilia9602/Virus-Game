import type { Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types/SocketEvents.types.ts";

export function createWaitingRoom(
    nickname: string,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    goToFirstPage: () => void,
    goToGamePage: () => void
): HTMLElement {
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

    // JS-animation för punkterna
    let dots = 0;
    const dotsInterval = setInterval(() => {
        dots = (dots + 1) % 4; // Loops 0,1,2,3
        dotsSpan.textContent = ".".repeat(dots);
    }, 500);

    // En ny div för att visa den stora nedräkningen (3, 2, 1)
    const countdownDisplay = document.createElement("div");
    countdownDisplay.className = "countdown-number";
    countdownDisplay.style.fontSize = "4rem"; // Gör den stor och tydlig
    countdownDisplay.style.fontWeight = "bold";
    wrapper.appendChild(countdownDisplay);

    // --- SOCKET LOGIK ---

    // 1. Skicka förfrågan om att gå med
    socket.emit("playerJoinRequest", nickname, (response: { success: boolean; gameRoomId: string}) => {
        console.log("Join response:", response);
    });

    // 2. När backend säger att 2 spelare är redo
    socket.on("startGameCountDown", () => {
        console.log("2 spelare redo! Förbereder nedräkning...");

        // Stoppa punkt-animationen
        clearInterval(dotsInterval);
        dotsSpan.textContent = "";

        // Byt text
        waitingText.textContent = "Game starts in...";
    });

    // 3. Lyssna på siffrorna (3, 2, 1, 0)
    socket.on("countDown", (num) => {
        // Visa siffran i UI
        countdownDisplay.textContent = num.toString();

        // Om siffran är 0 -> NAVIGERA TILL SPELSIDAN
        if (num === 0) {
            console.log("Nedräkning klar! Navigerar till gamePage.");
            goToGamePage();
        }
    });

    // --------------------

    // Visa nickname
    const playerName = document.createElement("p");
    playerName.textContent = `Your nickname: ${nickname}`;
    wrapper.appendChild(playerName);

    container.appendChild(wrapper);

    // Exit knapp
    const exitButton = document.createElement("button");
    exitButton.textContent = "Exit";
    exitButton.className ="exit-button";
    exitButton.onclick = () => {
        clearInterval(dotsInterval); // Städa upp intervallet om man går ur
        goToFirstPage();
    };
    container.appendChild(exitButton);

    return container;
}