const formulaList = [
  {
    formula: "F = __ × a",
    answer: "m",
    hint: "Newton’s 2nd law",
    fullFormula: "F = m × a",
    explanation: "Force equals mass times acceleration. Common in physics and aerospace mechanics."
  },
  {
    formula: "v = u + __ × t",
    answer: "a",
    hint: "Equation of motion",
    fullFormula: "v = u + a × t",
    explanation: "Used to calculate final velocity when acceleration and time are known."
  },
  {
    formula: "T = 2π√(L / __)",
    answer: "g",
    hint: "Pendulum time period",
    fullFormula: "T = 2π√(L / g)",
    explanation: "Time period of a simple pendulum. g = acceleration due to gravity."
  },
  {
    formula: "L = 0.5 × ρ × v² × S × __",
    answer: "Cl",
    hint: "Lift equation",
    fullFormula: "L = 0.5 × ρ × v² × S × Cl",
    explanation: "Lift depends on air density, velocity, wing area and lift coefficient."
  },
  {
    formula: "_ = mc²",
    answer: "E",
    hint: "Einstein’s equation",
    fullFormula: "E = mc²",
    explanation: "Energy equals mass times speed of light squared. A famous equation from relativity."
  },
  {
    formula: "A = π × r × __",
    answer: "r",
    hint: "Area of circle",
    fullFormula: "A = π × r × r",
    explanation: "Used to compute area of a circular section in geometry and structures."
  },
  {
    formula: "F_c = m × v² / __",
    answer: "r",
    hint: "Centripetal force",
    fullFormula: "F_c = m × v² / r",
    explanation: "Used in orbital mechanics and curved motion systems."
  },
  {
    formula: "s = ut + 0.5 × a × __²",
    answer: "t",
    hint: "Displacement formula",
    fullFormula: "s = ut + 0.5 × a × t²",
    explanation: "Used in uniformly accelerated motion to calculate displacement."
  },
  {
    formula: "I = V / __",
    answer: "R",
    hint: "Ohm’s Law",
    fullFormula: "I = V / R",
    explanation: "Current equals voltage over resistance. Core of electrical systems."
  },
  {
    formula: "ΔP = ρ × g × __",
    answer: "h",
    hint: "Pressure difference",
    fullFormula: "ΔP = ρ × g × h",
    explanation: "Pressure variation due to fluid height (e.g. fuel tanks)."
  }
];

let current = 0;
let attemptsLeft = 5;

function loadFormula() {
  const f = formulaList[current];
  document.getElementById("formula-display").textContent = f.formula;
  document.getElementById("guess-input").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("hint").style.display = "none";
  document.getElementById("reveal-box").style.display = "none";
  document.getElementById("guess-input").disabled = false;
  attemptsLeft = 5;
  document.getElementById("attempt-counter").textContent = `Attempts left: ${attemptsLeft}`;
}


function checkGuess() {
  const input = document.getElementById("guess-input").value.trim().toLowerCase();
  const correct = formulaList[current].answer.toLowerCase();

  if (input === correct) {
    document.getElementById("feedback").textContent = "✅ Correct!";
    document.getElementById("feedback").style.color = "green";
    document.getElementById("guess-input").disabled = true;
  } else {
    attemptsLeft--;
    document.getElementById("attempt-counter").textContent = `Attempts left: ${attemptsLeft}`;
    if (attemptsLeft > 0) {
      document.getElementById("feedback").textContent = "❌ Try Again!";
      document.getElementById("feedback").style.color = "red";
    } else {
      document.getElementById("feedback").textContent = `❌ Out of attempts! Answer: "${correct}"`;
      document.getElementById("feedback").style.color = "darkred";
      document.getElementById("guess-input").disabled = true;
      setTimeout(nextFormula, 2000);
    }
  }
}

function showHint() {
  const hint = formulaList[current].hint;
  const hintEl = document.getElementById("hint");
  hintEl.textContent = "💡 Hint: " + hint;
  hintEl.style.display = "block";
}

function nextFormula() {
  current = (current + 1) % formulaList.length;
  loadFormula();
}
function revealAnswer() {
  const f = formulaList[current];
  document.getElementById("full-formula").textContent = f.fullFormula;
  document.getElementById("formula-explanation").textContent = f.explanation;
  document.getElementById("reveal-box").style.display = "block";
  document.getElementById("guess-input").disabled = true;
}


// Load first on start
window.onload = loadFormula;
