/**
 * PracticeWordle — game.js
 * Core game logic: unlimited Wordle with state persistence,
 * word tracking, shuffle, dark mode, and faithful animations.
 */

'use strict';

// ── Constants ───────────────────────────────────────────────────────────────
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const LS_STATE_KEY = 'pw_game_state';
const LS_USED_KEY = 'pw_used_words';
const LS_DARK_KEY = 'pw_dark_mode';
const GUESS_DELAY = 300; // ms between tile flips

// ── Game State ──────────────────────────────────────────────────────────────
let state = {
    answer: '',
    guesses: [],      // Array of submitted guess strings
    evaluations: [],      // Array of arrays: ['correct','present','absent',...]
    currentGuess: '',
    gameOver: false,
    gameWon: false,
    rowIndex: 0,
};

// ── DOM References ──────────────────────────────────────────────────────────
const board = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const toastContainer = document.getElementById('toast-container');
const gameOverOverlay = document.getElementById('game-over-overlay');
const gameOverResult = document.getElementById('game-over-result');
const gameOverAnswer = document.getElementById('game-over-answer');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnShuffle = document.getElementById('btn-shuffle');
const btnDarkMode = document.getElementById('btn-dark-mode');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');

// ── Utility: shuffled unused word ──────────────────────────────────────────
function getUsedWords() {
    try {
        return JSON.parse(localStorage.getItem(LS_USED_KEY)) || [];
    } catch { return []; }
}

function addUsedWord(word) {
    const used = getUsedWords();
    if (!used.includes(word)) used.push(word);
    // If all words used, reset the pool
    if (used.length >= WORD_LIST.length) {
        localStorage.setItem(LS_USED_KEY, JSON.stringify([]));
    } else {
        localStorage.setItem(LS_USED_KEY, JSON.stringify(used));
    }
}

function pickNewWord() {
    const used = getUsedWords();
    const available = WORD_LIST.filter(w => !used.includes(w));
    const pool = available.length > 0 ? available : WORD_LIST;
    return pool[Math.floor(Math.random() * pool.length)];
}

// ── State Persistence ───────────────────────────────────────────────────────
function saveState() {
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(state));
}

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_STATE_KEY));
        if (saved && saved.answer && WORD_LIST.includes(saved.answer)) {
            return saved;
        }
    } catch { }
    return null;
}

// ── Board Rendering ─────────────────────────────────────────────────────────
let tileEls = []; // [row][col]

function buildBoard() {
    board.innerHTML = '';
    tileEls = [];
    for (let r = 0; r < MAX_GUESSES; r++) {
        const rowEl = document.createElement('div');
        rowEl.classList.add('row');
        rowEl.setAttribute('role', 'group');
        rowEl.setAttribute('aria-label', `Row ${r + 1}`);
        const rowTiles = [];
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.state = 'empty';
            tile.dataset.animation = 'idle';
            tile.setAttribute('role', 'img');
            tile.setAttribute('aria-label', `${ordinal(c + 1)} letter, empty`);
            rowEl.appendChild(tile);
            rowTiles.push(tile);
        }
        board.appendChild(rowEl);
        tileEls.push(rowTiles);
    }
}

function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Restoring State ─────────────────────────────────────────────────────────
function restoreBoard() {
    for (let r = 0; r < state.guesses.length; r++) {
        const guess = state.guesses[r];
        const evals = state.evaluations[r];
        // Fill tiles
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = tileEls[r][c];
            tile.textContent = guess[c].toUpperCase();
            tile.setAttribute('aria-label', `${ordinal(c + 1)} letter, ${guess[c]}, ${evals[c]}`);
            tile.dataset.state = evals[c];
        }
        // Update keyboard
        for (let c = 0; c < WORD_LENGTH; c++) {
            updateKeyState(guess[c], evals[c]);
        }
    }
    if (state.gameOver) {
        setTimeout(() => showGameOver(), 200);
    }
}

// ── Current Row Rendering ───────────────────────────────────────────────────
function renderCurrentGuess() {
    const row = tileEls[state.rowIndex];
    if (!row) return;
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = row[c];
        const letter = state.currentGuess[c] || '';
        tile.textContent = letter.toUpperCase();
        if (letter) {
            tile.dataset.state = 'tbd';
            tile.setAttribute('aria-label', `${ordinal(c + 1)} letter, ${letter}`);
        } else {
            tile.dataset.state = 'empty';
            tile.setAttribute('aria-label', `${ordinal(c + 1)} letter, empty`);
        }
    }
}

// ── Input Handling ──────────────────────────────────────────────────────────
function handleKey(key) {
    if (state.gameOver) return;
    const k = key.toLowerCase();

    if (k === 'enter') {
        submitGuess();
    } else if (k === 'backspace') {
        deleteLetter();
    } else if (/^[a-z]$/.test(k)) {
        addLetter(k);
    }
}

function addLetter(letter) {
    if (state.currentGuess.length >= WORD_LENGTH) return;
    state.currentGuess += letter;
    const col = state.currentGuess.length - 1;
    const tile = tileEls[state.rowIndex][col];
    tile.textContent = letter.toUpperCase();
    tile.dataset.state = 'tbd';
    tile.setAttribute('aria-label', `${ordinal(col + 1)} letter, ${letter}`);
    animatePop(tile);
}

function deleteLetter() {
    if (state.currentGuess.length === 0) return;
    const col = state.currentGuess.length - 1;
    const tile = tileEls[state.rowIndex][col];
    tile.textContent = '';
    tile.dataset.state = 'empty';
    tile.setAttribute('aria-label', `${ordinal(col + 1)} letter, empty`);
    state.currentGuess = state.currentGuess.slice(0, -1);
}

// ── Guess Submission ────────────────────────────────────────────────────────
function submitGuess() {
    const guess = state.currentGuess;

    if (guess.length < WORD_LENGTH) {
        showToast('Not enough letters');
        shakeRow(state.rowIndex);
        return;
    }

    if (!WORD_LIST.includes(guess.toLowerCase())) {
        showToast('Not in word list');
        shakeRow(state.rowIndex);
        return;
    }

    // Evaluate
    const evaluation = evaluateGuess(guess, state.answer);

    // Update state
    state.guesses.push(guess);
    state.evaluations.push(evaluation);
    state.currentGuess = '';

    // Animate row reveal
    revealRow(state.rowIndex, guess, evaluation, () => {
        // Update keyboard after reveal
        for (let c = 0; c < WORD_LENGTH; c++) {
            updateKeyState(guess[c], evaluation[c]);
        }

        const won = evaluation.every(e => e === 'correct');
        state.rowIndex++;

        if (won) {
            state.gameOver = true;
            state.gameWon = true;
            addUsedWord(state.answer);
            saveState();
            setTimeout(() => {
                bounceRow(state.rowIndex - 1);
                showToast(winMessage(state.rowIndex));
                setTimeout(() => showGameOver(), 1600);
            }, 100);
        } else if (state.rowIndex >= MAX_GUESSES) {
            state.gameOver = true;
            state.gameWon = false;
            addUsedWord(state.answer);
            saveState();
            setTimeout(() => showGameOver(), 500);
        } else {
            saveState();
        }
    });
}

function evaluateGuess(guess, answer) {
    const result = Array(WORD_LENGTH).fill('absent');
    const answerLetters = answer.split('');
    const guessLetters = guess.split('');
    const used = Array(WORD_LENGTH).fill(false);

    // First pass: correct
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = 'correct';
            used[i] = true;
            answerLetters[i] = null;
        }
    }
    // Second pass: present
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (result[i] === 'correct') continue;
        for (let j = 0; j < WORD_LENGTH; j++) {
            if (!used[j] && guessLetters[i] === answerLetters[j]) {
                result[i] = 'present';
                used[j] = true;
                answerLetters[j] = null;
                break;
            }
        }
    }
    return result;
}

// ── Animations ──────────────────────────────────────────────────────────────
function animatePop(tile) {
    tile.classList.remove('pop');
    void tile.offsetWidth; // reflow
    tile.classList.add('pop');
    tile.addEventListener('animationend', () => tile.classList.remove('pop'), { once: true });
}

function shakeRow(rowIndex) {
    const rowEl = board.children[rowIndex];
    if (!rowEl) return;
    rowEl.classList.remove('shake');
    void rowEl.offsetWidth;
    rowEl.classList.add('shake');
    rowEl.addEventListener('animationend', () => rowEl.classList.remove('shake'), { once: true });
}

function bounceRow(rowIndex) {
    const tiles = tileEls[rowIndex];
    if (!tiles) return;
    tiles.forEach((tile, i) => {
        setTimeout(() => {
            tile.classList.add('bounce');
            tile.addEventListener('animationend', () => tile.classList.remove('bounce'), { once: true });
        }, i * 100);
    });
}

function revealRow(rowIndex, guess, evaluation, callback) {
    const tiles = tileEls[rowIndex];
    const FLIP_DURATION = 300;

    tiles.forEach((tile, i) => {
        setTimeout(() => {
            // Flip out
            tile.classList.add('flip-out');

            setTimeout(() => {
                // Apply state mid-flip
                tile.dataset.state = evaluation[i];
                tile.setAttribute('aria-label',
                    `${ordinal(i + 1)} letter, ${guess[i]}, ${evaluation[i]}`);
                tile.classList.remove('flip-out');
                tile.classList.add('flip-in');
                tile.addEventListener('animationend', () => tile.classList.remove('flip-in'), { once: true });
            }, FLIP_DURATION / 2);

            if (i === WORD_LENGTH - 1) {
                setTimeout(() => callback(), FLIP_DURATION);
            }
        }, i * GUESS_DELAY);
    });
}

// ── Keyboard State ──────────────────────────────────────────────────────────
function updateKeyState(letter, evaluation) {
    const key = keyboardEl.querySelector(`[data-key="${letter.toLowerCase()}"]`);
    if (!key) return;
    const current = key.dataset.state;
    // Priority: correct > present > absent
    const priority = { correct: 3, present: 2, absent: 1 };
    if (!current || (priority[evaluation] > (priority[current] || 0))) {
        key.dataset.state = evaluation;
    }
}

function resetKeyboard() {
    keyboardEl.querySelectorAll('.key[data-key]').forEach(key => {
        delete key.dataset.state;
    });
}

// ── Toast ───────────────────────────────────────────────────────────────────
function showToast(message, duration = 1800) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, duration + 400);
}

function winMessage(guessCount) {
    const msgs = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
    return msgs[Math.min(guessCount - 1, msgs.length - 1)];
}

// ── Game Over ───────────────────────────────────────────────────────────────
function showGameOver() {
    if (state.gameWon) {
        gameOverResult.textContent = `🎉 You got it!`;
        gameOverAnswer.innerHTML = `The word was <span>${state.answer.toUpperCase()}</span>`;
    } else {
        gameOverResult.textContent = `Better luck next time!`;
        gameOverAnswer.innerHTML = `The word was <span>${state.answer.toUpperCase()}</span>`;
    }
    gameOverOverlay.style.display = 'flex';
}

function hideGameOver() {
    gameOverOverlay.style.display = 'none';
}

// ── New Game / Shuffle ──────────────────────────────────────────────────────
function startNewGame(forceNewWord = false) {
    hideGameOver();
    resetKeyboard();

    if (forceNewWord || state.gameOver) {
        state = {
            answer: pickNewWord(),
            guesses: [],
            evaluations: [],
            currentGuess: '',
            gameOver: false,
            gameWon: false,
            rowIndex: 0,
        };
        saveState();
    }

    buildBoard();
    restoreBoard();
    renderCurrentGuess();
}

function shuffleNewGame() {
    // Add current word to used if game was in-progress
    if (!state.gameOver && state.guesses.length > 0) {
        addUsedWord(state.answer);
    }
    state = {
        answer: pickNewWord(),
        guesses: [],
        evaluations: [],
        currentGuess: '',
        gameOver: false,
        gameWon: false,
        rowIndex: 0,
    };
    saveState();
    buildBoard();
    renderCurrentGuess();
    showToast('New word!', 1000);
}

// ── Dark Mode ───────────────────────────────────────────────────────────────
function applyDarkMode(isDark) {
    document.body.classList.toggle('dark', isDark);
    iconMoon.style.display = isDark ? 'none' : 'block';
    iconSun.style.display = isDark ? 'block' : 'none';
    localStorage.setItem(LS_DARK_KEY, isDark ? '1' : '0');
}

// ── Keyboard Events ─────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    handleKey(e.key);
});

keyboardEl.addEventListener('click', (e) => {
    const key = e.target.closest('.key');
    if (!key) return;
    const k = key.dataset.key;
    if (k === 'Enter') handleKey('Enter');
    else if (k === 'Backspace') handleKey('Backspace');
    else if (k) handleKey(k);
});

btnPlayAgain.addEventListener('click', () => startNewGame(true));
btnShuffle.addEventListener('click', shuffleNewGame);
btnDarkMode.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    applyDarkMode(isDark);
});

// Prevent double-tap zoom on mobile keyboards
keyboardEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    const key = e.target.closest('.key');
    if (!key) return;
    const k = key.dataset.key;
    if (k === 'Enter') handleKey('Enter');
    else if (k === 'Backspace') handleKey('Backspace');
    else if (k) handleKey(k);
}, { passive: false });

// ── Initialisation ───────────────────────────────────────────────────────────
function init() {
    // Apply dark mode preference
    const savedDark = localStorage.getItem(LS_DARK_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDarkMode(savedDark !== null ? savedDark === '1' : prefersDark);

    // Load or create state
    const saved = loadState();
    if (saved) {
        state = saved;
        buildBoard();
        restoreBoard();
        renderCurrentGuess();
    } else {
        state.answer = pickNewWord();
        saveState();
        buildBoard();
    }
}

init();
