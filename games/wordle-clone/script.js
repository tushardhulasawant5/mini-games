let wordLength = 5;
let targetWord = "";
let maxGuesses = 6;
let currentRow = 0;
let currentGuess = "";
let gameOver = false;
let wordList = [];

const board = document.getElementById("game-board");
const message = document.getElementById("message");
const restartBtn = document.getElementById("restart");
const selectorButtons = document.querySelectorAll("#word-length-selector button");
const keyboardContainer = document.getElementById("keyboard");

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

selectorButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    wordLength = parseInt(btn.dataset.length);
    await startGame();
  });
});

async function loadWords(length) {
  try {
    // Cache-bust in case GitHub Pages is serving an older 404
    const url = `words/words${length}.json?v=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty or invalid JSON");
    return data.map(w => (typeof w === "string" ? w.toUpperCase() : w));
  } catch (err) {
    console.warn("Using fallback word list:", err.message);

    const fallback = {
      5: ["PLANE","ROTOR","WINGS","GLIDE","CLOUD","TRACK","DRIVE","CRANE","DELTA","SPEED"],
      6: ["THRUST","TURBINE","AERIAL","ROCKET","ENGINE","SENSOR","FILTER","INTAKE"],
      7: ["AIRFOIL","CONTROL","ORBITAL","PAYLOAD","AVIONIC","TRAJECT"]
    };
    return fallback[length] || fallback[5];
  }
}


function pickRandomWord(words) {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex].toUpperCase();
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < maxGuesses; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < wordLength; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

function updateRow() {
  const row = board.children[currentRow];
  for (let i = 0; i < wordLength; i++) {
    row.children[i].textContent = currentGuess[i] || "";
  }
}

function handleKey(e) {
  if (gameOver) return;
  const key = e.key ? e.key.toUpperCase() : e.toUpperCase();

  if (key === "ENTER") {
    submitGuess();
  } else if (key === "BACKSPACE" || key === "⌫") {
    currentGuess = currentGuess.slice(0, -1);
    updateRow();
  } else if (/^[A-Z]$/.test(key) && currentGuess.length < wordLength) {
    currentGuess += key;
    updateRow();
  }
}

function submitGuess() {
  if (currentGuess.length !== wordLength) {
    showMessage("⛔ Not enough letters");
    return;
  }

  if (!wordList.includes(currentGuess.toLowerCase())) {
    showMessage("❌ Not a valid word");
    return;
  }

  const row = board.children[currentRow];
  const guessArray = currentGuess.split("");
  const targetArray = targetWord.split("");

  for (let i = 0; i < wordLength; i++) {
    const cell = row.children[i];
    const letter = guessArray[i];
    const keyButton = document.querySelector(`.key[data-key='${letter}']`);

    if (letter === targetArray[i]) {
      cell.classList.add("correct");
      if (keyButton) keyButton.classList.remove("present", "absent"), keyButton.classList.add("correct");
    } else if (targetArray.includes(letter)) {
      cell.classList.add("present");
      if (keyButton && !keyButton.classList.contains("correct")) {
        keyButton.classList.remove("absent");
        keyButton.classList.add("present");
      }
    } else {
      cell.classList.add("absent");
      if (keyButton && !keyButton.classList.contains("correct") && !keyButton.classList.contains("present")) {
        keyButton.classList.add("absent");
      }
    }
  }

  if (currentGuess === targetWord) {
    showMessage("🎉 You guessed it!");
    endGame();
    return;
  }

  currentRow++;
  currentGuess = "";

  if (currentRow === maxGuesses) {
    showMessage(`❌ Game Over! Word was: ${targetWord}`);
    endGame();
  }
}

function showMessage(msg) {
  message.textContent = msg;
}

function endGame() {
  gameOver = true;
  restartBtn.style.display = "inline-block";
}

restartBtn.addEventListener("click", startGame);

async function startGame(len = 5) {
  wordLength = len;
  currentRow = 0;
  currentGuess = "";
  gameOver = false;

  wordList = await loadWords(wordLength);
  targetWord = wordList[Math.floor(Math.random() * wordList.length)];

  buildBoard();       // your function that creates the grid DOM
  buildKeyboard();    // your function that renders on-screen keys
  updateRow();        // render the first empty row
  showMessage("");    // clear messages
  console.log("Target:", targetWord); // helpful for testing
}

// wire up the length buttons
document.querySelectorAll("#word-length-selector button").forEach(btn => {
  btn.addEventListener("click", () => startGame(parseInt(btn.dataset.len, 10)));
});

// on load
window.addEventListener("load", () => startGame(5));


function createKeyboard() {
  keyboardContainer.innerHTML = "";

  const layout = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Backspace"]
  ];

  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");

    row.forEach(key => {
      const button = document.createElement("button");
      button.textContent = key === "Backspace" ? "⌫" : key;
      button.className = "key";
      button.setAttribute("data-key", key);
      button.addEventListener("click", () => handleKey(key));
      rowDiv.appendChild(button);
    });

    keyboardContainer.appendChild(rowDiv);
  });
}




window.addEventListener("load", () => {
  startGame();
});
