console.log("LOG 4.1: firstPage.ts script execution");

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
        button, // In your original code 'button' was appended directly, but you also had 'buttonWrapper'. Keeping it as per your code.
        statsWrapper
    );

    container.append(contentWrapper);
    return container
}
