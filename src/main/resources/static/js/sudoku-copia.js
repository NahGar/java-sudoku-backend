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

function checkSavedGame() {
  const savedGame = localStorage.getItem('sudokuDailyGame');
  if (savedGame) {
    const gameData = JSON.parse(savedGame);
    if (gameData.date === currentDate) {
      selectedDifficulty = gameData.difficulty;
      startGameUI();
      loadGame(gameData);
    }
  }
}

function setupEventListeners() {
  document.getElementById('start-game-btn').addEventListener('click', startNewGame);
}

function startGameUI() {
  document.getElementById('difficulty-selector').style.display = 'none';
  document.getElementById('game-content').style.display = 'block';
  document.getElementById('current-difficulty').value = selectedDifficulty;
}

async function startNewGame() {
  const difficulty = document.getElementById('difficulty').value;
  if (!difficulty) {
    alert('Por favor selecciona una dificultad');
    return;
  }

  selectedDifficulty = difficulty;
  startGameUI();

  try {
    const data = await fetchSudoku(difficulty);
    board = data.board;
    solution = data.solution;

    saveGameState();
    renderBoard();
    renderButtons();

    attempts = 3;
    gameTime = 0;
    updateAttempts();
    startTimer();
    gameActive = true;

  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar el sudoku. Intenta recargar la página.');
    resetUI();
  }
}

function loadGame(gameData) {
  board = gameData.board;
  solution = gameData.solution;
  attempts = gameData.attempts || 3;
  gameTime = gameData.time || 0;

  renderBoard();
  renderButtons();
  updateAttempts();
  updateTimer();

  if (gameTime > 0) {
    startTimer();
  }

  gameActive = true;
}

function saveGameState() {
  const gameState = {
    date: currentDate,
    difficulty: selectedDifficulty,
    board: board,
    solution: solution,
    attempts: attempts,
    time: gameTime
  };
  localStorage.setItem('sudokuDailyGame', JSON.stringify(gameState));
}

function resetUI() {
  document.getElementById('difficulty-selector').style.display = 'block';
  document.getElementById('game-content').style.display = 'none';
  selectedDifficulty = null;
  gameActive = false;
}

async function fetchSudoku(difficulty) {
  const response = await fetch(`http://localhost:8080/api/sudoku/daily?difficulty=${difficulty}`);
  if (!response.ok) throw new Error('Error al obtener el sudoku');
  return await response.json();
}

function renderBoard() {
  const table = document.getElementById("sudoku-board");
  table.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < 9; c++) {
      const td = document.createElement("td");
      td.dataset.row = r;
      td.dataset.col = c;

      if (board[r][c] !== 0) {
        td.textContent = board[r][c];
        td.classList.add("prefilled");
      }
      td.addEventListener("click", () => selectCell(td));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function renderButtons() {
  const container = document.getElementById("num-buttons");
  container.innerHTML = "";
  const completedNumbers = checkCompletedNumbers();

  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (completedNumbers.has(i)) {
      btn.disabled = true;
      btn.classList.add("disabled-btn");
    }
    btn.addEventListener("click", () => placeNumber(i));
    container.appendChild(btn);
  }
}

function endGame(success) {
  gameActive = false;
  stopTimer();
  saveGameState();

  if (success) {
    alert(`¡Felicidades! Completaste el sudoku en ${document.getElementById('time').textContent}`);
  } else {
    alert('¡Game Over! Se acabaron tus intentos.');
  }
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

function updateAttempts() {
  document.getElementById('attempts').textContent = attempts;
}

function checkCompletedNumbers() {
  const completedNumbers = new Set();

  for (let num = 1; num <= 9; num++) {
    let allCorrect = true;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (solution[r][c] === num && board[r][c] !== num) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }
    if (allCorrect) completedNumbers.add(num);
  }

  return completedNumbers;
}

function selectCell(td) {
    if (!gameActive) return;

    // Limpiar selección y resaltados anteriores
    clearHighlights();
    if (selectedCell) {
        selectedCell.classList.remove("selected");
    }

    const row = parseInt(td.dataset.row);
    const col = parseInt(td.dataset.col);
    const cellValue = td.textContent;
    const isPrefilled = td.classList.contains("prefilled");

    // Seleccionar solo celdas editables o celdas prefilled incorrectas
    if (!isPrefilled || (cellValue && board[row][col] !== solution[row][col])) {
        selectedCell = td;
        td.classList.add("selected");
    }

    // Resaltar números iguales (solo si hay un valor)
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

function clearHighlights() {
    // Limpiar TODOS los resaltados, incluyendo same-number
    document.querySelectorAll('#sudoku-board td').forEach(cell => {
        cell.classList.remove('highlighted', 'highlighted-block', 'same-number');
    });
}

function placeNumber(num) {
  if (!selectedCell || selectedCell.classList.contains("prefilled") || !gameActive) return;

  const r = +selectedCell.dataset.row;
  const c = +selectedCell.dataset.col;

  if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
    selectedCell.textContent = num;
    board[r][c] = num;

    if (solution[r][c] === num) {
      selectedCell.style.color = "green";
    } else {
      selectedCell.style.color = "red";
      increaseAttempt(); // Cambiado de decreaseAttempt()
    }

    selectedCell.classList.remove("selected");
    clearHighlights();
    selectedCell = null;

    renderButtons();

    if (checkBoardComplete()) {
      endGame(true);
    }
  }
}