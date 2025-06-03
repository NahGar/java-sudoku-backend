import { URL_API_BACKEND_SUDOKU } from './globales.js';

// Variables globales
let board = [];
let solution = [];
let selectedCell = null;
let attempts = 3;
let gameTime = 0;
let timerInterval = null;
let gameActive = false;
let currentDate = new Date().toISOString().split('T')[0];
let selectedDifficulty = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkSavedGame();
    setupEventListeners();
});

// Función para verificar juegos guardados
function checkSavedGame() {
    const savedData = localStorage.getItem('sudokuDailyGames');
    if (savedData) {
        const allGames = JSON.parse(savedData);
        if (allGames.date === currentDate) {
            document.getElementById('difficulty-selector').style.display = 'block';
        }
    }
}

// Configuración de event listeners
function setupEventListeners() {
    document.getElementById('difficulty').addEventListener('change', function() {
        const difficulty = this.value;
        if (!difficulty) {
            // Si se selecciona la opción en blanco, ocultar el juego
            document.getElementById('game-content').style.display = 'none';
            return;
        }

        // Detener el temporizador actual si hay un juego en curso
        if (gameActive) {
            stopTimer();
            saveGameState();
        }

        selectedDifficulty = difficulty;
        initializeGame();
    });

    document.getElementById('game-over-notification').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
}

// Función para inicializar el juego
function initializeGame() {
    const savedData = localStorage.getItem('sudokuDailyGames');
    let gameData = savedData ? JSON.parse(savedData) : { date: currentDate, games: {} };

    // Si es un nuevo día o no hay datos, crear estructura nueva
    if (gameData.date !== currentDate) {
        gameData = { date: currentDate, games: {} };
    }

    // Si no existe juego para esta dificultad, crear uno nuevo
    if (!gameData.games[selectedDifficulty]) {
        createNewGame();
    } else {
        loadGame(gameData.games[selectedDifficulty]);
    }

    // Mostrar la dificultad actual
    showGameUI();
}

// Función para crear nuevo juego
async function createNewGame() {
    try {
        const data = await fetchSudoku(selectedDifficulty);
        board = data.board;
        solution = data.solution;

        attempts = 3;
        gameTime = 0;
        gameActive = true;

        saveGameState();
        renderBoard();
        renderButtons();
        startTimer();
        showGameUI();

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el sudoku. Intenta recargar la página.');
    }
}

// Función para cargar juego existente
function loadGame(savedGame) {
    board = savedGame.board || [];
    solution = savedGame.solution || [];
    attempts = savedGame.attempts || 3;
    gameTime = savedGame.time || 0;
    gameActive = !savedGame.completed;

    renderBoard();
    renderButtons();
    updateAttempts();
    updateTimer();
    showGameUI();

    //if (gameActive && gameTime > 0) {
    if (gameActive) {
        startTimer();
    }

    renderButtons();
}

// Función para mostrar la interfaz de juego
function showGameUI() {
    document.getElementById('game-content').style.display = 'block';
}

// Función para guardar el estado del juego
function saveGameState(completed = false) {
    const savedData = localStorage.getItem('sudokuDailyGames');
    let allGames = savedData ? JSON.parse(savedData) : { date: currentDate, games: {} };

    if (allGames.date !== currentDate) {
        allGames = { date: currentDate, games: {} };
    }

    allGames.games[selectedDifficulty] = {
        board: board,
        solution: solution,
        attempts: attempts,
        time: gameTime,
        completed: completed || checkBoardComplete()
    };

    localStorage.setItem('sudokuDailyGames', JSON.stringify(allGames));
}

// Función para obtener el sudoku del backend
async function fetchSudoku(difficulty) {
    console.log(`URL:${URL_API_BACKEND_SUDOKU}/sudoku/daily?difficulty=${difficulty}`);
    const response = await fetch(`${URL_API_BACKEND_SUDOKU}/sudoku/daily?difficulty=${difficulty}`);
    if (!response.ok) throw new Error('Error al obtener el sudoku');
    return await response.json();
}

// Función para renderizar el tablero
function renderBoard() {
    const table = document.getElementById('sudoku-board');
    table.innerHTML = '';

    for (let row = 0; row < 9; row++) {
        const tr = document.createElement('tr');

        for (let col = 0; col < 9; col++) {
            const td = document.createElement('td');
            td.dataset.row = row;
            td.dataset.col = col;

            if (board[row][col] !== 0) {
                td.textContent = board[row][col];

                if (board[row][col] === solution[row][col]) {
                    td.classList.add("prefilled");
                } else {
                    td.style.color = "red";
                    td.classList.add("error"); // Marcar como celda con error
                }
            }

            td.addEventListener('click', () => selectCell(td));
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }
}

// Función para renderizar los botones numéricos
function renderButtons() {
    const container = document.getElementById('num-buttons');
    container.innerHTML = '';

    for (let number = 1; number <= 9; number++) {
        const button = document.createElement('button');
        const correctCount = countCorrectNumbers(number);

        button.innerHTML = `${number}<span class="count-badge">${correctCount}</span>`;
        button.value = number;

        if (isNumberComplete(number)) {
            button.disabled = true;
            button.classList.add('disabled-btn');
        }

        button.addEventListener('click', () => placeNumber(number));
        container.appendChild(button);
    }
}

//Contar números correctos
function countCorrectNumbers(num) {
    let count = 0;
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === num && board[row][col] === solution[row][col]) {
                count++;
            }
        }
    }
    return count;
}

// Función para verificar si un número está completo
function isNumberComplete(number) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (solution[row][col] === number && board[row][col] !== number) {
                return false;
            }
        }
    }
    return true;
}

// Función para seleccionar una celda
function selectCell(td) {
    if (!gameActive) return;

    clearHighlights();
    if (selectedCell) {
        selectedCell.classList.remove("selected");
    }

    const row = parseInt(td.dataset.row);
    const col = parseInt(td.dataset.col);
    const cellValue = td.textContent;
    const isPrefilled = td.classList.contains("prefilled");

    if (!isPrefilled || (cellValue && board[row][col] !== solution[row][col])) {
        selectedCell = td;
        td.classList.add("selected");
    }

    if (cellValue) {
        document.querySelectorAll('#sudoku-board td').forEach(cell => {
            if (cell.textContent === cellValue && cell !== td) {
                cell.classList.add("same-number");
            }
        });
    }

    // Resaltar fila y columna
    document.querySelectorAll(`td[data-row="${row}"], td[data-col="${col}"]`).forEach(cell => {
        if (cell !== td) cell.classList.add("highlighted");
    });

    // Resaltar bloque 3x3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            const cell = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
            if (cell && cell !== td) cell.classList.add("highlighted-block");
        }
    }
}

// Función para limpiar resaltados
function clearHighlights() {
    document.querySelectorAll('#sudoku-board td').forEach(cell => {
        cell.classList.remove('highlighted', 'highlighted-block', 'same-number');
    });
}

// Función para colocar un número
function placeNumber(num) {
    if (!selectedCell || !gameActive) return;

    const r = +selectedCell.dataset.row;
    const c = +selectedCell.dataset.col;
    const currentValue = board[r][c];

    // Permitir sobrescribir números incorrectos (rojos) sin penalización
    if (currentValue !== 0 && currentValue === solution[r][c]) {
        return; // No permitir cambiar números prefilled correctos
    }

    // Si el valor es el mismo que ya estaba, no hacer nada
    if (currentValue === num) {
        return;
    }

    // Colocar el nuevo número
    selectedCell.textContent = num;
    board[r][c] = num;

    // Verificar si es correcto
    if (num === solution[r][c]) {
        selectedCell.style.color = "green";
        selectedCell.classList.remove("error");

        renderButtons();
    } else {
        selectedCell.style.color = "red";
        selectedCell.classList.add("error");
        attempts--;
        updateAttempts();

        if (attempts <= 0) {
            endGame(false);
        }
    }

    // Limpiar selección
    selectedCell.classList.remove("selected");
    clearHighlights();
    selectedCell = null;

    renderButtons();
    saveGameState();

    if (checkBoardComplete()) {
        endGame(true);
    }
}

// Función para verificar si el tablero está completo
function checkBoardComplete() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0 || board[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }
    return true;
}

// Función para terminar el juego
function endGame(success) {
    gameActive = false;
    stopTimer();
    saveGameState(success);

    const notification = document.getElementById('game-over-notification');
    const notificationContent = notification.querySelector('.notification-content');

    if (success) {
        notificationContent.innerHTML = `
            <h2>¡Felicidades!</h2>
            <p>Completaste el sudoku ${selectedDifficulty} en ${document.getElementById('time').textContent}</p>
            <button id="close-notification">Aceptar</button>
        `;
    } else {
        notificationContent.innerHTML = `
            <h2>¡Game Over!</h2>
            <p>Se acabaron tus intentos.</p>
            <button id="close-notification">Aceptar</button>
        `;
    }

    notification.classList.remove('hidden');

    document.getElementById('close-notification').onclick = function() {
        notification.classList.add('hidden');
    };
}

function showNotification() {
    const notification = document.getElementById('game-over-notification');
    notification.classList.remove('hidden');

    document.getElementById('close-notification').onclick = function() {
        notification.classList.add('hidden');
    };
}

// Funciones del temporizador
function startTimer() {
    stopTimer();
    updateTimer();
    timerInterval = setInterval(() => {
        gameTime++;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimer() {
    const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
    const seconds = (gameTime % 60).toString().padStart(2, '0');
    document.getElementById('time').textContent = `${minutes}:${seconds}`;
}

// Función para actualizar los intentos mostrados
function updateAttempts() {
    document.getElementById('attempts').textContent = attempts;
}

// Función para verificar y resetear diariamente
function checkDailyReset() {
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    if (lastPlayedDate !== currentDate) {
        localStorage.removeItem('sudokuDailyGames');
        localStorage.setItem('lastPlayedDate', currentDate);
    }
}

function changeDifficulty(newDifficulty) {
    if (gameActive) {
        // Guardar estado actual antes de cambiar
        saveGameState();
    }
    selectedDifficulty = newDifficulty;
    initializeGame();
}

async function obtenerRanking(dificultad) {
    try {
        const response = await fetch(`${URL_API_BACKEND_SUDOKU}/ranking/${dificultad}`);
        if (!response.ok) throw new Error('Error al obtener el ranking');
        const ranking = await response.json();
        mostrarRanking(ranking);
    } catch (error) {
        console.error(error);
    }
}

function mostrarRanking(ranking) {
    const tabla = document.getElementById('ranking-table').querySelector('tbody');
    tabla.innerHTML = '';
    ranking.forEach(entry => {
        const tiempo = formatSecondsToHHMMSS(entry.tiempoSegundos);
        const tr = document.createElement('tr');
        const tdNombre = document.createElement('td');
        const tdTiempo = document.createElement('td');
        tdNombre.textContent = entry.nombre;
        tdTiempo.textContent = tiempo;
        tdTiempo.style.textAlign = 'right';
        tr.appendChild(tdNombre);
        tr.appendChild(tdTiempo);
        tabla.appendChild(tr);
    });
}

function formatSecondsToHHMMSS(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60).toString().padStart(2, '0');
    const s = (segundos % 60).toString().padStart(2, '0');
    return h > 0 ? `${h.toString().padStart(2, '0')}:${m}:${s}` : `${m}:${s}`;
}

// Llama a obtenerRanking cuando se seleccione una dificultad
document.getElementById('difficulty').addEventListener('change', (event) => {
    const dificultad = event.target.value;
    const rankingDiv = document.getElementById('ranking-container');
    if (dificultad) {
        rankingDiv.style.display = 'block';
        obtenerRanking(dificultad);
    } else {
        rankingDiv.style.display = 'none';
    }
});

// Inicializar verificación diaria
checkDailyReset();