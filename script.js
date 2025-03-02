const gameContainer = document.getElementById('game-container');
const categorySelection = document.getElementById('category-selection');
const questionContainer = document.getElementById('question-container');
const summaryContainer = document.getElementById('summary-container');
const categoryButtons = document.getElementById('category-buttons');
const questionTitle = document.getElementById('question-title');
const questionContent = document.getElementById('question-content');
const answersDiv = document.getElementById('answers');
const nextRoundButtonDiv = document.getElementById('next-round');
const nextRoundButton = document.getElementById('next-round-button');
const summaryText = document.getElementById('summary-text');
const currentRoundDisplay = document.getElementById('current-round');
const currentQuestionDisplay = document.getElementById('current-question');
const correctCountDisplay = document.getElementById('correct-count');
const timerDisplay = document.getElementById('timer');
const timerInput = document.getElementById('timer-input');

let questions = [];
let currentQuestionIndex = 0;
let roundNumber = 1;
let correctAnswersCount = 0;
let totalQuestions = 0;
let timer;
let allCategories = [];
let askedQuestions = []; // Track asked questions

async function fetchAllCategories() {
    const url = 'https://opentdb.com/api_category.php';
    const response = await fetch(url);
    const data = await response.json();
    allCategories = data.trivia_categories;
}

function displayRandomCategoryButtons() {
    shuffleArray(allCategories);
    categoryButtons.innerHTML = '';

    const selectedCategories = allCategories.slice(0, 5);

    selectedCategories.forEach(category => {
        const button = document.createElement('button');
        button.dataset.category = category.id;
        button.textContent = category.name;
        button.addEventListener('click', () => {
            const timerDuration = parseInt(timerInput.value, 10);
            fetchQuestions(category.id, timerDuration);
            categorySelection.style.display = 'none';
            questionContainer.style.display = 'block';
        });
        categoryButtons.appendChild(button);
    });
}

nextRoundButton.addEventListener('click', async () => {
    roundNumber++;
    currentRoundDisplay.textContent = roundNumber;
    currentQuestionIndex = 0;
    questionContainer.style.display = 'none';
    nextRoundButtonDiv.style.display = 'none';
    if (roundNumber <= 3) {
        displayRandomCategoryButtons();
        categorySelection.style.display = 'block';
    } else {
        showSummary();
    }
});

async function fetchQuestions(categoryId, timerDuration) {
    let attempts = 0;
    while (attempts < 5) {
        const url = `https://opentdb.com/api.php?amount=5&category=${categoryId}&type=multiple`;
        const response = await fetch(url);
        const data = await response.json();
        const newQuestions = data.results.filter(q => !askedQuestions.includes(q.question));

        if (newQuestions.length === 5) {
            questions = newQuestions;
            questions.forEach(q => askedQuestions.push(q.question));
            totalQuestions += questions.length;
            displayQuestion(timerDuration);
            return;
        }
        attempts++;
    }
    alert("Could not retrieve unique questions.");
}

function displayQuestion(timerDuration) {
    if (currentQuestionIndex < questions.length) {
        timerDisplay.textContent = timerDuration;
        startTimer(timerDuration);
        const question = questions[currentQuestionIndex];
        questionTitle.textContent = `Question`;
        questionContent.innerHTML = question.question;
        answersDiv.innerHTML = '';

        const allAnswers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(allAnswers);

        allAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.innerHTML = answer;
            button.addEventListener('click', () => checkAnswer(answer, question.correct_answer, timerDuration));
            answersDiv.appendChild(button);
        });
        currentQuestionDisplay.textContent = `${currentQuestionIndex + 1}`;
    } else {
        if (roundNumber < 3) {
            nextRoundButtonDiv.style.display = 'block';
        } else {
            showSummary();
        }
    }
}

function checkAnswer(selectedAnswer, correctAnswer, timerDuration) {
    clearInterval(timer);
    const buttons = answersDiv.querySelectorAll('button');

    buttons.forEach(button => {
        if (button.innerHTML === correctAnswer) {
            button.classList.add('correct');
        } else if (button.innerHTML === selectedAnswer && selectedAnswer !== correctAnswer) {
            button.classList.add('wrong');
        }
        button.disabled = true;
    });

    if (selectedAnswer === correctAnswer) {
        correctAnswersCount++;
        correctCountDisplay.textContent = correctAnswersCount;
    }

    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion(timerDuration);
        } else {
            if (roundNumber < 3) {
                nextRoundButtonDiv.style.display = 'block';
            } else {
                showSummary();
            }
        }
    }, 3000); // 3-second delay
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer(timerDuration) {
    clearInterval(timer);

    let remainingTime = timerDuration;
    timerDisplay.textContent = remainingTime;

    timer = setInterval(() => {
        remainingTime--;
        timerDisplay.textContent = remainingTime;

        if (remainingTime <= 0) {
            clearInterval(timer);
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion(timerDuration);
            } else {
                if (roundNumber < 3) {
                    nextRoundButtonDiv.style.display = 'block';
                } else {
                    showSummary();
                }
            }
        }
    }, 1000);
}

function showSummary() {
    questionContainer.style.display = 'none';
    summaryContainer.style.display = 'block';

    let summaryMessage = `You answered ${correctAnswersCount} out of ${totalQuestions} questions correctly. `;

    if (correctAnswersCount === 15) {
        summaryMessage += "You're a trivia god!";
    } else if (correctAnswersCount >= 10) {
        summaryMessage += "Not bad! You'd make a great trivia night teammate!";
    } else if (correctAnswersCount >= 5) {
        summaryMessage += "Good try. Keep practicing!";
    } else {
        summaryMessage += "That was rough. Keep playing!";
    }

    summaryText.textContent = summaryMessage;
}

(async () => {
    await fetchAllCategories();
    displayRandomCategoryButtons();
})();