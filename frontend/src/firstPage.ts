export function createFirstPage(onStart: (nickname: string) => void): HTMLElement {
    const container = document.createElement("section");
    container.className = "first-page";

    container.innerHTML = `
        <div class="content-wrapper">
            <img src="/virushero.jpg" alt="Game Logo" class="game-logo">

            <div class="instructions-wrapper">
                <button class="instructions-button">How to Play</button>
            </div>

            <div class="instructions-box" style="display: none;">
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
                    <h3>Recent Matches</h3>
                    <ul id="history-list" class="stats-list">
                        <li class="loading-msg">No recent matches</li>
                    </ul>
                </div>

                <div class="stats-card">
                    <h3>Active Games</h3>
                    <div id="active-games-list" class="active-games-container">
                        <p id="active-games-count" class="stats-count">0</p>
                        <ul id="live-games-details" class="stats-list"></ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    const input = container.querySelector("#nickname") as HTMLInputElement;
    const startBtn = container.querySelector(".start-button") as HTMLButtonElement;
    const instructionsBtn = container.querySelector(".instructions-button") as HTMLButtonElement;
    const instructionsBox = container.querySelector(".instructions-box") as HTMLElement;

    startBtn.onclick = () => {
        const name = input.value.trim();
        if (!name) return alert("Please enter a nickname!");
        onStart(name);
    };

    instructionsBtn.onclick = () => {
        const isHidden = instructionsBox.style.display === "none";
        instructionsBox.style.display = isHidden ? "block" : "none";
    };

    return container;
}

// - - - - LÄS HÄR - - - -
//Ska allt detta bort? Det är ju exakt samma som står ovan och koden funkar som den ska :)

/* console.log("LOG 4.1: firstPage.ts script execution");

export function createFirstPage(onStart: (nickname: string) => void): HTMLElement {
    console.log("LOG 4.2: createFirstPage() called");
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
        console.log("LOG 5.1: Start button clicked, input value:", name);
        if (!name) return alert("Please enter a nickname!")
        console.log("LOG 5.2: Calling onStart callback");
        onStart(name)
    };

    const buttonWrapper= document.createElement("div");
    buttonWrapper.className = "button-wrapper";
    buttonWrapper.append(button);

    const instructionsButton = document.createElement("button");
    instructionsButton.textContent = "How to Play";
    instructionsButton.className = "instructions-button";

    const instructionsWrapper = document.createElement("div");
    instructionsWrapper.className = "instructions-wrapper";
    instructionsWrapper.append(instructionsButton);

    const instructionsBox = document.createElement("div");
    instructionsBox.className = "instructions-box";
    instructionsBox.style.display = "none";

    const instructionsTitle = document.createElement("h3");
    instructionsTitle.textContent = "How to Play:";

    const rule1 = document.createElement("p");
    rule1.textContent = "Click the virus as fast as possible.";

    const rule2 = document.createElement("p");
    rule2.textContent = "The fastest player gets the point.";

    const rule3 = document.createElement("p");
    rule3.textContent = "The player with most points wins.";

    instructionsBox.append(instructionsTitle, rule1, rule2, rule3);

    instructionsButton.onclick = () => {
        instructionsBox.style.display =
        instructionsBox.style.display === "none" ? "block" : "none";
    }

    const statsWrapper = document.createElement("div");
    statsWrapper.className ="stats-wrapper";

    const historyCard = document.createElement("div");
    historyCard.className = "stats-card";
    const historyTitle = document.createElement("h3");
    historyTitle.textContent = "Recent Matches";
    const historyList = document.createElement("ul");
    historyList.id = "history-list";
    historyList.className = "stats-list";
    historyCard.append(historyTitle, historyList);

    const activeCard = document.createElement("div");
    activeCard.className = "stats-card";
    const activeTitle = document.createElement("h3");
    activeTitle.textContent ="Active Games";
    const activeCount = document.createElement("p");
    activeCount.id = "active-games-count";
    activeCount.className = "stats-count";
    activeCount.textContent = "0";
    activeCard.append(activeTitle, activeCount);
    statsWrapper.append(historyCard, activeCard);

    contentWrapper.append(
        logo,
        instructionsWrapper,
        instructionsBox,
        input,
        button,
        statsWrapper
    );

    container.append(contentWrapper);
    return container
}
 */
