const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const startButton = document.getElementById("start");
const categoryContainer = document.getElementById("categories");
const categoryTitle = document.getElementById("current-category");
const questionContainer = document.getElementById("question-container");
const questionText = document.getElementById("questions");
const answersBox = document.getElementById("answers");
const nextButton = document.getElementById("next");
const finalResult = document.getElementById("final-result");
const restartButton = document.getElementById("restart");

let player1Name = "";
let player2Name = "";
let player1Score = 0;
let player2Score = 0;
let questions = [];
let currentQuestionIndex = 0;
let currentPlayer = 1;

startButton.addEventListener("click", () => {
  player1Name = player1Input.value.trim();
  player2Name = player2Input.value.trim();

  if (!player1Name || !player2Name) {
    alert("Both player names are required.");
    return;
  }
  if (player1Name.toLowerCase() === player2Name.toLowerCase()) {
    alert("Player names must be different.");
    return;
  }

  document.querySelector(".setup").classList.add("hidden");
  document.querySelector(".instructions").classList.add("hidden");
  fetchCategories();
});

function fetchCategories() {
  fetch("https://the-trivia-api.com/api/categories")
    .then((response) => response.json())
    .then((data) => {
      displayCategories(data);
    });
}

function displayCategories(categories) {
  categoryContainer.innerHTML = "";
  document.querySelector(".category-selection").classList.remove("hidden");

  const categoryList = Object.keys(categories);
  categoryList.forEach((category) => {
    const categoryButton = document.createElement("button");
    categoryButton.textContent = category;
    categoryButton.classList.add("category-button");
    categoryContainer.appendChild(categoryButton);
    categoryButton.addEventListener("click", () => {
      const categoryValue = categories[category][0];
      fetchQuestions(categoryValue);
    });
  });

  const randomButton = document.createElement("button");
  randomButton.textContent = "Random";
  randomButton.classList.add("category-button");
  randomButton.addEventListener("click", () => {
    const randomIndex = [Math.floor(Math.random() * categoryList.length)];
    const randomKey = categoryList[randomIndex];
    const randomCategory = categories[randomKey][0];

    fetchQuestions(randomCategory);
  });
  categoryContainer.appendChild(randomButton);
}

function fetchQuestions(category) {
  document.querySelector(".category-selection").classList.add("hidden");
  const easyQuestionUrl = `https://the-trivia-api.com/api/questions?categories=${category}&difficulty=easy&limit=2`;
  const mediumQuestionUrl = `https://the-trivia-api.com/api/questions?categories=${category}&difficulty=medium&limit=2`;
  const hardQuestionUrl = `https://the-trivia-api.com/api/questions?categories=${category}&difficulty=hard&limit=2`;

  Promise.all([
    fetch(easyQuestionUrl).then((response) => response.json()),
    fetch(mediumQuestionUrl).then((response) => response.json()),
    fetch(hardQuestionUrl).then((response) => response.json()),
  ]).then(([easyQuestions, mediumQuestions, hardQuestions]) => {
    questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    const categoryText = document.querySelector(".category-button").textContent;
    categoryTitle.textContent = `Category: ${categoryText}`;
    document.querySelector(".game").classList.remove("hidden");
    showQuestion();
  });
}

function showQuestion() {
  if (currentQuestionIndex < questions.length) {
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = `${
      currentPlayer === 1 ? player1Name : player2Name
    }'s turn: ${currentQuestion.question}`;
    answersBox.innerHTML = "";

    const allAnswers = currentQuestion.incorrectAnswers
      .concat(currentQuestion.correctAnswer)
      .sort();
    allAnswers.forEach((answer) => {
      const button = document.createElement("button");
      button.textContent = answer;
      button.classList.add("answer-button");
      button.addEventListener("click", () => checkAnswer(button, answer));
      answersBox.appendChild(button);
    });
  } else {
    endGame();
  }
}

function checkAnswer(button, selectedAnswer) {
  const correctAnswer = questions[currentQuestionIndex].correctAnswer;

  const answerButtons = document.querySelectorAll(".answer-button");
  answerButtons.forEach((btn) => (btn.disabled = true));

  button.style.backgroundColor =
    selectedAnswer === correctAnswer ? "green" : "red";

  if (selectedAnswer === correctAnswer) {
    const points = getScoreForDifficulty(
      questions[currentQuestionIndex].difficulty
    );
    if (currentPlayer === 1) {
      player1Score += points;
    } else {
      player2Score += points;
    }
  }
  currentQuestionIndex++;
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  nextButton.classList.remove("hidden");
}

function getScoreForDifficulty(difficulty) {
  if (difficulty === "easy") return 10;
  if (difficulty === "medium") return 15;
  if (difficulty === "hard") return 20;
  return 0;
}

nextButton.addEventListener("click", () => {
  nextButton.classList.add("hidden");
  showQuestion();
});

function endGame() {
  document.querySelector(".game").classList.add("hidden");
  document.querySelector(".result").classList.remove("hidden");
  if (player1Score > player2Score) {
    finalResult.textContent = `${player1Name} wins with ${player1Score} points!`;
  } else if (player2Score > player1Score) {
    finalResult.textContent = `${player2Name} wins with ${player2Score} points!`;
  } else {
    finalResult.textContent = `It's a tie! Both scored ${player1Score} points.`;
  }
}

restartButton.addEventListener("click", () => {
  window.location.reload();
});
