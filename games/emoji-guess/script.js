const emojiList = [
  { emoji: "🍔🍟🥤", answer: "fast food", hint: "Quick meal combo" },
  { emoji: "📱🍎", answer: "apple", hint: "Popular tech brand" },
  { emoji: "🎬🍿🌃", answer: "movie night", hint: "Watching something fun" },
  { emoji: "🚗⛽", answer: "gas station", hint: "You stop here to refuel" },
  { emoji: "🌧️☂️", answer: "rainy day", hint: "Take an umbrella!" },
  { emoji: "🎄🎁", answer: "christmas", hint: "Holiday in December" },
  { emoji: "🛏️💤", answer: "sleep", hint: "Zzz..." },
  { emoji: "✈️🧳", answer: "travel", hint: "Pack your bags!" },
  { emoji: "🐶🐱", answer: "pets", hint: "Furry friends" },
  { emoji: "🏠🛋️", answer: "home", hint: "Where you live" },
  { emoji: "📖☕", answer: "reading", hint: "Books and coffee" },
  { emoji: "🎧🎵", answer: "music", hint: "What you hear with headphones" },
  { emoji: "🚿🧼", answer: "shower", hint: "Morning routine" },
  { emoji: "🌞😎", answer: "sunny day", hint: "Bright and hot weather" },
  { emoji: "🧊🍹", answer: "cold drink", hint: "Refreshing beverage" },
  { emoji: "🌮🌯", answer: "mexican food", hint: "Spicy and tasty cuisine" },
  { emoji: "🏀⛹️", answer: "basketball", hint: "Bounce and shoot" },
  { emoji: "🍰🎂", answer: "birthday", hint: "A day for celebration and cake" },
  { emoji: "🖥️⌨️", answer: "computer", hint: "Used for work and play" },
  { emoji: "🐣🥚", answer: "easter", hint: "Eggs and spring holiday" },
  { emoji: "🧛🧟", answer: "halloween", hint: "Spooky night with costumes" },
  { emoji: "💍👰", answer: "wedding", hint: "Rings and vows" },
  { emoji: "📷🤳", answer: "selfie", hint: "Picture taken by yourself" },
  { emoji: "📺🍿", answer: "binge watch", hint: "TV marathon" },
  { emoji: "🌌🔭", answer: "stargazing", hint: "Looking at the night sky" },
  { emoji: "🌊🏖️", answer: "beach day", hint: "Sun, sand, and waves" },
  { emoji: "🧹🪣", answer: "cleaning", hint: "Chores at home" },
  { emoji: "💪🏋️", answer: "gym", hint: "Workout location" },
  { emoji: "🧘‍♂️🕯️", answer: "meditation", hint: "Mindfulness practice" },
  { emoji: "🧪🧫", answer: "science", hint: "Experiments and lab work" },
  { emoji: "🗺️🧭", answer: "adventure", hint: "Explore the unknown" },
  { emoji: "💻📚", answer: "online class", hint: "Study from home" },
  { emoji: "🛒🧃", answer: "grocery shopping", hint: "Buying food and supplies" },
  { emoji: "🚲🛴", answer: "ride", hint: "Two-wheeled transport" },
  { emoji: "🐒🍌", answer: "monkey", hint: "Loves bananas" },
  { emoji: "🕶️🏝️", answer: "vacation", hint: "Time off from work" },
  { emoji: "👨‍🍳🍳", answer: "cooking", hint: "Making meals" },
  { emoji: "🦷🪥", answer: "brushing teeth", hint: "Dental hygiene" },
  { emoji: "🎤🎶", answer: "karaoke", hint: "Sing with lyrics on screen" },
  { emoji: "👕👖", answer: "clothes", hint: "What you wear" },
  { emoji: "📦🚚", answer: "delivery", hint: "Amazon-style service" },
  { emoji: "📅🕒", answer: "schedule", hint: "Plan of events" },
  { emoji: "🔒🔑", answer: "lock and key", hint: "Used for security" },
  { emoji: "👟🏃", answer: "running shoes", hint: "Worn for exercise" },
  { emoji: "🦁🐯", answer: "wild animals", hint: "Live in jungles or savannahs" },
  { emoji: "🥗🥕", answer: "healthy food", hint: "Good for the body" },
  { emoji: "💼👔", answer: "office", hint: "Place of work" },
  { emoji: "📊💻", answer: "work from home", hint: "Remote job" },
  { emoji: "🧩🧠", answer: "puzzle", hint: "Brain game" },
  { emoji: "💤📱", answer: "phone addiction", hint: "Can't sleep without it" }
];

let current = 0;
let attemptsLeft = 5;


function loadEmoji() {
  document.getElementById("emoji-display").textContent = emojiList[current].emoji;
  document.getElementById("guess-input").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("hint").style.display = "none";  // Hide hint
}


function checkGuess() {
  const input = document.getElementById("guess-input").value.trim().toLowerCase();
  const correct = emojiList[current].answer.toLowerCase();

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
      document.getElementById("feedback").textContent = `❌ Out of attempts! The answer was: "${correct}"`;
      document.getElementById("feedback").style.color = "darkred";
      document.getElementById("guess-input").disabled = true;

      // Optional: wait 2 seconds before auto-moving to next puzzle
      setTimeout(nextEmoji, 2000);
    }
  }
}


function nextEmoji() {
  current = (current + 1) % emojiList.length;
  document.getElementById("guess-input").disabled = false;
  loadEmoji();
}


function loadEmoji() {
  document.getElementById("emoji-display").textContent = emojiList[current].emoji;
  document.getElementById("guess-input").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("hint").style.display = "none";
  attemptsLeft = 5;
  document.getElementById("attempt-counter").textContent = `Attempts left: ${attemptsLeft}`;
}



function showHint() {
  const hint = emojiList[current].hint;
  const hintElement = document.getElementById("hint");
  hintElement.textContent = "💡 Hint: " + hint;
  hintElement.style.display = "block";
}
// Load first emoji
window.onload = loadEmoji;