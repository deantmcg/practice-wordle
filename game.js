/**
 * PracticeWordle — game.js
 * Core game logic: unlimited Wordle with state persistence,
 * word tracking, shuffle, dark mode, and faithful animations.
 *
 * Dictionary is loaded asynchronously from words.txt.
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

// Populated asynchronously from words.txt
let WORD_LIST = [];

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

// ── Load Dictionary ─────────────────────────────────────────────────────────
/**
 * Fetches words.txt and parses it into a deduped array of valid 5-letter
 * lowercase words, then calls init() to start the game.
 *
 * Performance note: words.txt is ~130 KB, fetched once and then cached by
 * the browser. Parsing overhead vs a pre-built JS array is <10 ms.
 */
async function loadWordList() {
    try {
        const res = await fetch('words.txt');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();

        WORD_LIST = [
            ...new Set(
                text
                    .split(/[\r\n]+/)
                    .map(w => w.trim().toLowerCase().replace(/[^a-z]/g, ''))
                    .filter(w => w.length === WORD_LENGTH)
            ),
        ];

        if (WORD_LIST.length === 0) throw new Error('Word list is empty after filtering');
        console.log(`[PracticeWordle] ${WORD_LIST.length} words loaded`);
        init();
    } catch (err) {
        console.error('[PracticeWordle] Failed to load words.txt:', err);
        showToast('Failed to load dictionary — please refresh.', 5000);
    }
}

// ── Used-word tracking ──────────────────────────────────────────────────────
function getUsedWords() {
    try { return JSON.parse(localStorage.getItem(LS_USED_KEY)) || []; }
    catch { return []; }
}

function addUsedWord(word) {
    const used = getUsedWords();
    if (!used.includes(word)) used.push(word);
    // Reset pool when all words have been seen
    localStorage.setItem(
        LS_USED_KEY,
        JSON.stringify(used.length >= WORD_LIST.length ? [] : used)
    );
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
        if (saved && saved.answer && WORD_LIST.includes(saved.answer)) return saved;
    } catch { }
    return null;
}

// ── Board ───────────────────────────────────────────────────────────────────
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

function restoreBoard() {
    for (let r = 0; r < state.guesses.length; r++) {
        const guess = state.guesses[r];
        const evals = state.evaluations[r];
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = tileEls[r][c];
            tile.textContent = guess[c].toUpperCase();
            tile.setAttribute('aria-label', `${ordinal(c + 1)} letter, ${guess[c]}, ${evals[c]}`);
            tile.dataset.state = evals[c];
            updateKeyState(guess[c], evals[c]);
        }
    }
    if (state.gameOver) setTimeout(showGameOver, 200);
}

function renderCurrentGuess() {
    const row = tileEls[state.rowIndex];
    if (!row) return;
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = row[c];
        const letter = state.currentGuess[c] || '';
        tile.textContent = letter.toUpperCase();
        tile.dataset.state = letter ? 'tbd' : 'empty';
        tile.setAttribute('aria-label',
            letter ? `${ordinal(c + 1)} letter, ${letter}` : `${ordinal(c + 1)} letter, empty`);
    }
}

// ── Input ───────────────────────────────────────────────────────────────────
function handleKey(key) {
    if (state.gameOver) return;
    const k = key.toLowerCase();
    if (k === 'enter') submitGuess();
    else if (k === 'backspace') deleteLetter();
    else if (/^[a-z]$/.test(k)) addLetter(k);
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
    if (!state.currentGuess.length) return;
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
    if (!WORD_LIST.includes(guess)) {
        showToast('Not in word list');
        shakeRow(state.rowIndex);
        return;
    }

    const evaluation = evaluateGuess(guess, state.answer);
    state.guesses.push(guess);
    state.evaluations.push(evaluation);
    state.currentGuess = '';

    revealRow(state.rowIndex, guess, evaluation, () => {
        for (let c = 0; c < WORD_LENGTH; c++) updateKeyState(guess[c], evaluation[c]);

        const won = evaluation.every(e => e === 'correct');
        state.rowIndex++;

        if (won) {
            state.gameOver = state.gameWon = true;
            addUsedWord(state.answer);
            saveState();
            setTimeout(() => {
                bounceRow(state.rowIndex - 1);
                showToast(winMessage(state.rowIndex));
                setTimeout(showGameOver, 1600);
            }, 100);
        } else if (state.rowIndex >= MAX_GUESSES) {
            state.gameOver = true;
            state.gameWon = false;
            addUsedWord(state.answer);
            saveState();
            setTimeout(showGameOver, 500);
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

    // Pass 1 — correct position
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = 'correct';
            used[i] = true;
            answerLetters[i] = null;
        }
    }
    // Pass 2 — present but wrong position
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
    void tile.offsetWidth;
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
    (tileEls[rowIndex] || []).forEach((tile, i) => {
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
            tile.classList.add('flip-out');
            setTimeout(() => {
                tile.dataset.state = evaluation[i];
                tile.setAttribute('aria-label',
                    `${ordinal(i + 1)} letter, ${guess[i]}, ${evaluation[i]}`);
                tile.classList.remove('flip-out');
                tile.classList.add('flip-in');
                tile.addEventListener('animationend',
                    () => tile.classList.remove('flip-in'), { once: true });
            }, FLIP_DURATION / 2);

            if (i === WORD_LENGTH - 1) setTimeout(callback, FLIP_DURATION);
        }, i * GUESS_DELAY);
    });
}

// ── Keyboard state ──────────────────────────────────────────────────────────
function updateKeyState(letter, evaluation) {
    const key = keyboardEl.querySelector(`[data-key="${letter.toLowerCase()}"]`);
    if (!key) return;
    const priority = { correct: 3, present: 2, absent: 1 };
    const current = key.dataset.state;
    if (!current || priority[evaluation] > (priority[current] || 0)) {
        key.dataset.state = evaluation;
    }
}

function resetKeyboard() {
    keyboardEl.querySelectorAll('.key[data-key]').forEach(k => delete k.dataset.state);
}

// ── Toast ───────────────────────────────────────────────────────────────────
function showToast(message, duration = 1800) {
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), duration + 400);
}

function winMessage(guessCount) {
    return ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!']
    [Math.min(guessCount - 1, 5)];
}

// ── Game Over ───────────────────────────────────────────────────────────────
function showGameOver() {
    gameOverResult.textContent = state.gameWon ? '🎉 You got it!' : 'Better luck next time!';
    gameOverAnswer.innerHTML = `The word was <span>${state.answer.toUpperCase()}</span>`;
    gameOverOverlay.style.display = 'flex';
}

function hideGameOver() {
    gameOverOverlay.style.display = 'none';
}

// ── New Game / Shuffle ──────────────────────────────────────────────────────
function startNewGame() {
    hideGameOver();
    resetKeyboard();
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
}

function shuffleNewGame() {
    if (!state.gameOver && state.guesses.length > 0) addUsedWord(state.answer);
    startNewGame();
    showToast('New word!', 1000);
}

// ── Dark Mode ───────────────────────────────────────────────────────────────
function applyDarkMode(isDark) {
    document.body.classList.toggle('dark', isDark);
    iconMoon.style.display = isDark ? 'none' : 'block';
    iconSun.style.display = isDark ? 'block' : 'none';
    localStorage.setItem(LS_DARK_KEY, isDark ? '1' : '0');
}

// ── Event listeners ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    handleKey(e.key);
});

keyboardEl.addEventListener('click', e => {
    const key = e.target.closest('.key');
    if (!key) return;
    const k = key.dataset.key;
    if (k === 'Enter') handleKey('Enter');
    else if (k === 'Backspace') handleKey('Backspace');
    else if (k) handleKey(k);
});

// Prevent double-tap zoom on mobile
keyboardEl.addEventListener('touchend', e => {
    e.preventDefault();
    const key = e.target.closest('.key');
    if (!key) return;
    const k = key.dataset.key;
    if (k === 'Enter') handleKey('Enter');
    else if (k === 'Backspace') handleKey('Backspace');
    else if (k) handleKey(k);
}, { passive: false });

btnPlayAgain.addEventListener('click', startNewGame);
btnShuffle.addEventListener('click', shuffleNewGame);
btnDarkMode.addEventListener('click', () => applyDarkMode(!document.body.classList.contains('dark')));

// ── Initialisation ───────────────────────────────────────────────────────────
function init() {
    const savedDark = localStorage.getItem(LS_DARK_KEY);
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyDarkMode(savedDark !== null ? savedDark === '1' : preferDark);

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

// ── Entry point ──────────────────────────────────────────────────────────────
// Apply dark mode immediately so there's no flash while words.txt loads
; (function () {
    const d = localStorage.getItem(LS_DARK_KEY);
    applyDarkMode(d !== null ? d === '1' : window.matchMedia('(prefers-color-scheme: dark)').matches);
})();

loadWordList();
