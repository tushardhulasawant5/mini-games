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
const keyboardContainer = document.getElementById("keyboard");

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// === Load words (cache-busted) with safe fallback ===
async function loadWords(length) {
  try {
    const url = `words/words${length}.json?v=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty list");
    return data.map(w => ("" + w).toUpperCase());
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

// === Board & keyboard ===
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

function createKeyboard() {
  keyboardContainer.innerHTML = "";
  const layout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Enter","Z","X","C","V","B","N","M","Backspace"]
  ];
  layout.forEach(keys => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row");
    keys.forEach(k => {
      const b = document.createElement("button");
      b.textContent = k === "Backspace" ? "⌫" : k;
      b.className = "key";
      b.dataset.key = k;
      b.addEventListener("click", () => handleKey(k));
      rowDiv.appendChild(b);
    });
    keyboardContainer.appendChild(rowDiv);
  });
}

// === Input handling ===
function handleKey(e) {
  if (gameOver) return;
  const key = e?.key ? e.key.toUpperCase() : ("" + e).toUpperCase();

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

document.addEventListener("keydown", handleKey); // enable physical keyboard

function submitGuess() {
  if (currentGuess.length !== wordLength) {
    showMessage("⛔ Not enough letters");
    return;
  }

  // wordList is UPPERCASE; guesses are built in UPPERCASE too
  if (!wordList.includes(currentGuess)) {
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
      if (keyButton) keyButton.classList.remove("present","absent"), keyButton.classList.add("correct");
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
  } else {
    updateRow();
  }
}

function showMessage(msg) { message.textContent = msg; }
function endGame() { gameOver = true; restartBtn.style.display = "inline-block"; }

restartBtn.addEventListener("click", () => startGame(wordLength));

// === Start / length selection ===
async function startGame(len = 5) {
  wordLength = len;
  currentRow = 0;
  currentGuess = "";
  gameOver = false;
  restartBtn.style.display = "none";

  wordList = await loadWords(wordLength);
  targetWord = wordList[Math.floor(Math.random() * wordList.length)];

  createBoard();
  createKeyboard();
  updateRow();
  showMessage("");
  console.log("Target:", targetWord);
}

// hook up the three buttons (they use data-length in your HTML)
document.querySelectorAll("#word-length-selector button").forEach(btn => {
  btn.addEventListener("click", () => startGame(parseInt(btn.dataset.length, 10)));
});

// boot
window.addEventListener("load", () => startGame(5));
