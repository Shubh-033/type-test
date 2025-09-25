const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const darkModeToggle = document.getElementById('darkModeToggle');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const progressBar = document.getElementById('progressBar');
const highScoresList = document.getElementById('highScores');

const sentences = {
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "A journey of a thousand miles begins with a single step.",
        "To be or not to be, that is the question.",
        "All that glitters is not gold.",
        "The only thing we have to fear is fear itself."
    ],
    medium: [
        "In the middle of difficulty lies opportunity.",
        "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        "The way to get started is to quit talking and begin doing.",
        "Your time is limited, so don't waste it living someone else's life.",
        "If life were predictable it would cease to be life, and be without flavor."
    ],
    hard: [
        "The Industrial Revolution and its consequences have been a disaster for the human race.",
        "Those who can make you believe absurdities can make you commit atrocities.",
        "It is forbidden to kill; therefore all murderers are punished unless they kill in large numbers and to the sound of trumpets.",
        "The further a society drifts from truth the more it will hate those who speak it.",
        "In a time of universal deceit - telling the truth is a revolutionary act."
    ]
};

let time = 0;
let currentSentence = '';
let interval;
let currentDifficulty = 'easy';
let lastSentenceIndex = -1;
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

function getRandomSentence() {
    const sentencesForDifficulty = sentences[currentDifficulty];
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * sentencesForDifficulty.length);
    } while (sentencesForDifficulty.length > 1 && randomIndex === lastSentenceIndex);
    lastSentenceIndex = randomIndex;
    return sentencesForDifficulty[randomIndex];
}

function updateTextDisplay() {
    currentSentence = getRandomSentence();
    textDisplay.innerHTML = '';
    currentSentence.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.innerText = char;
        textDisplay.appendChild(charSpan);
    });
    textInput.value = '';
    progressBar.style.width = '0%';
}

function startTimer() {
    if (!interval) {
        interval = setInterval(() => {
            time++;
            timerEl.innerText = time + 's';
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function calculateStats() {
    const typedText = textInput.value;
    const typedWords = typedText.split(/\s+/).filter(word => word !== '').length;
    const wpm = Math.round((typedWords / time) * 60) || 0;
    wpmEl.innerText = wpm;

    let correctChars = 0;
    const textChars = currentSentence.split('');
    const typedChars = typedText.split('');
    textChars.forEach((char, index) => {
        if (typedChars[index] === char) {
            correctChars++;
        }
    });
    const accuracy = Math.round((correctChars / typedChars.length) * 100) || 100;
    accuracyEl.innerText = accuracy + '%';

    saveHighScore(wpm, accuracy);
}

function showHighScores() {
    highScoresList.innerHTML = highScores
        .map(score => `<li>${score.wpm} WPM - ${score.accuracy}% Accuracy</li>`)
        .join('');
}

function saveHighScore(wpm, accuracy) {
    const score = { wpm, accuracy };
    highScores.push(score);
    highScores.sort((a, b) => b.wpm - a.wpm);
    highScores.splice(5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    showHighScores();
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    lastSentenceIndex = -1;
    updateTextDisplay();
});

textInput.addEventListener('input', () => {
    startTimer();
    const textChars = textDisplay.querySelectorAll('span');
    const typedChars = textInput.value.split('');
    const progress = (typedChars.length / textChars.length) * 100;
    progressBar.style.width = `${progress}%`;

    textChars.forEach((charSpan, index) => {
        const char = typedChars[index];
        if (char == null) {
            charSpan.classList.remove('correct', 'incorrect');
        } else if (char === charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
        }
    });

    if (typedChars.length === currentSentence.length) {
        stopTimer();
        calculateStats();
    }
});

restartBtn.addEventListener('click', () => {
    stopTimer();
    time = 0;
    timerEl.innerText = '0s';
    wpmEl.innerText = '0';
    accuracyEl.innerText = '100%';
    updateTextDisplay();
});

updateTextDisplay();
showHighScores();
