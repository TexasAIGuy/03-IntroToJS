// ✅ If you see this in the Console, your JS is running.
console.log("warpdrive.js loaded (no-popups version)");

// 🧺 We remember how many attempts each FINISHED game took.
// Example after 3 wins: [4, 7, 2]
const attemptsPerGame = [];

// 🧠 Game state that changes every round
let targetNumber = null;   // the secret number for THIS round
let guessCount = 0;        // attempts for THIS round
let gameActive = false;    // are we currently playing?

// 🔎 Grab all the pieces we’ll talk to on the page
let startBtn, againBtn, guessForm, guessInput, guessBtn, messageEl, roundCounterEl, attemptsThisRoundEl;
let totalGamesEl, bestEl, averageEl, attemptListEl, resetBtn, resetConfirm, resetYes, resetNo;
let rocket; // ⬅️ Rocket Flames
window.addEventListener("DOMContentLoaded", () => { //This is a DOM content loader handler
  // 🎯 Game controls
  startBtn           = document.getElementById("startBtn");
  againBtn           = document.getElementById("againBtn");
  guessForm          = document.getElementById("guessForm");
  guessInput         = document.getElementById("guessInput");
  guessBtn           = document.getElementById("guessBtn");
  messageEl          = document.getElementById("message");
  roundCounterEl     = document.getElementById("roundCounter");
  attemptsThisRoundEl= document.getElementById("attemptsThisRound");
  rocket             = document.getElementById("rocket"); // ⬅️ NEW

  // 📊 Stats controls
  totalGamesEl  = document.getElementById("totalGames");
  bestEl        = document.getElementById("best");
  averageEl     = document.getElementById("average");
  attemptListEl = document.getElementById("attemptList");

  // 🧼 Reset controls (inline confirmation)
  resetBtn     = document.getElementById("resetBtn");
  resetConfirm = document.getElementById("resetConfirm");
  resetYes     = document.getElementById("resetYes");
  resetNo      = document.getElementById("resetNo");

  // 🖱️ Hook up buttons + form
  startBtn.addEventListener("click", startNewGame);
  againBtn.addEventListener("click", startNewGame);
  guessForm.addEventListener("submit", onGuessSubmit);

  // Reset stats (no popups)
  resetBtn.addEventListener("click", () => {
    // show the little “are you sure?” area
    resetConfirm.style.display = "inline";
  });
  resetYes.addEventListener("click", () => {
    attemptsPerGame.length = 0; // wipe history
    updateStatsUI();
    resetConfirm.style.display = "none";
  });
  resetNo.addEventListener("click", () => {
    resetConfirm.style.display = "none";
  });

  // First-time UI setup
  updateStatsUI();
  updateResetButtonState();
  setIdleUI();
});

/* =========================
   GAME FLOW (no popups)
   ========================= */

// ▶️ Start (or restart) a round
function startNewGame() {
  // 🎲 Pick a fresh secret number (1–100)
  targetNumber = Math.floor(Math.random() * 100) + 1;
  guessCount = 0;
  gameActive = true;

// 🚀 Reset rocket visibility/animation each round (hide it until you win)
  if (rocket) {
    rocket.classList.remove("ignite");
    rocket.classList.remove("show");
  }

  // 🗣️ Tell the player what’s happening (on the page)
  messageEl.textContent = "The rebel force is in trouble, Luke and we need your help. Dark Vader is randomly picking number between 1 - 100. If we dont guess the right number in less than 3 attempts, we are all doomed!";
  messageEl.className = "success"; // or "warn", "info"

  // 🧰 Turn on the form + round counter, hide “Play Again” button
  guessForm.style.display = "inline-block";
  againBtn.style.display = "none";
  roundCounterEl.style.display = "block";
  attemptsThisRoundEl.textContent = "0";

  // Focus the input so the player can type right away
  guessInput.value = "";
  guessInput.focus();
}

// 📝 Handle a guess (form submit)
function onGuessSubmit(e) {
  e.preventDefault(); // don’t reload the page
  if (!gameActive) return;

  // Get the number from the input box
  const value = guessInput.value.trim();
  const guess = parseInt(value, 10);

  // 🚧 Validate: must be a whole number 1–100
  if (Number.isNaN(guess) || guess < 1 || guess > 100) {
    messageEl.textContent = "Please enter a whole number from 1 to 100.";
    guessInput.focus();
    return;
  }

  // Count this real guess
  guessCount++;
  attemptsThisRoundEl.textContent = String(guessCount);

  // Compare to the secret number and give feedback
if (guess === targetNumber) {
  // 🎉 Win!
  messageEl.textContent = `✅ Correct! You won in ${guessCount} attempt${guessCount === 1 ? "" : "s"}.`;
  messageEl.className = "success"; // optional if using success style
  gameActive = false;

// 🚀 Reveal + ignite thrusters on win
if (rocket) {
  rocket.classList.add("show");    // make visible
  // give the reveal a tick, then ignite
  setTimeout(() => rocket.classList.add("ignite"), 50);
  // stop the flame after ~1.6s
  setTimeout(() => rocket.classList.remove("ignite"), 1600);
}

  // Save to stats + refresh
  attemptsPerGame.push(guessCount);
  updateStatsUI();

  // Show Play Again; hide the form
  guessForm.style.display = "none";
  againBtn.style.display = "inline-block";
  updateResetButtonState();

} else if (guess < targetNumber) {
  messageEl.textContent = "⬇️ Too low. Try a bigger number.";
  messageEl.className = "info";
  // 🧼 Clear the box on wrong guess
  guessInput.value = "";
  guessInput.focus();
} else {
  messageEl.textContent = "⬆️ Too high. Try a smaller number.";
  messageEl.className = "info";
  // 🧼 Clear the box on wrong guess
  guessInput.value = "";
  guessInput.focus();
}

  // Make the next guess quick to enter
  //guessInput.select(); Removed to clear the guess box
}

/* =========================
   STATS + UI HELPERS
   ========================= */

// Put fresh numbers into the Stats section
function updateStatsUI() {
  const total = attemptsPerGame.length;
  totalGamesEl.textContent = total;

  if (total === 0) {
    bestEl.textContent = "—";
    averageEl.textContent = "—";
    attemptListEl.innerHTML = "";
    return;
  }

  const best = Math.min(...attemptsPerGame);
  const sum = attemptsPerGame.reduce((a, b) => a + b, 0);
  const average = (sum / total).toFixed(2);

  bestEl.textContent = best;
  averageEl.textContent = average;

  // Rebuild the history list (Game 1 — X attempts)
  attemptListEl.innerHTML = "";
  attemptsPerGame.forEach((attempts, i) => {
    const li = document.createElement("li");
    li.textContent = `Game ${i + 1} — ${attempts} attempt${attempts === 1 ? "" : "s"}`;
    attemptListEl.appendChild(li);
  });
}

// Disable Reset when there’s nothing to reset
function updateResetButtonState() {
  resetBtn.disabled = attemptsPerGame.length === 0;
}

// Show the “waiting to start” look
function setIdleUI() {
  messageEl.textContent = "Click “Start Game” to begin!";
  guessForm.style.display = "none";
  againBtn.style.display = "none";
  roundCounterEl.style.display = "none";
}
