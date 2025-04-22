let board = [], solution = [], selectedCell = null;
let attempts = 0;
let gameTime = 0;
let timerInterval = null;
let gameActive = false;

// Función para mezclar un array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Verificar si un número es seguro en una posición
function isSafe(b, row, col, num) {
  // Verificar fila y columna
  for (let x = 0; x < 9; x++) {
    if (b[row][x] === num || b[x][col] === num) return false;
  }

  // Verificar bloque 3x3
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (b[i + startRow][j + startCol] === num) return false;
    }
  }
  return true;
}

// Resolver el tablero recursivamente
function solveBoard(b, row = 0, col = 0) {
  if (row === 9) return true;
  if (col === 9) return solveBoard(b, row + 1, 0);
  if (b[row][col] !== 0) return solveBoard(b, row, col + 1);

  for (let num of shuffle([1,2,3,4,5,6,7,8,9])) {
    if (isSafe(b, row, col, num)) {
      b[row][col] = num;
      if (solveBoard(b, row, col + 1)) return true;
      b[row][col] = 0;
    }
  }
  return false;
}

// Generar un nuevo tablero según la dificultad
function generateBoard(difficulty) {
  board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveBoard(board);
  solution = JSON.parse(JSON.stringify(board));

  let toRemove = difficulty === "easy" ? 35 :
                 difficulty === "medium" ? 45 : 55;

  while (toRemove > 0) {
    let r = Math.floor(Math.random() * 9);
    let c = Math.floor(Math.random() * 9);
    if (board[r][c] !== 0) {
      board[r][c] = 0;
      toRemove--;
    }
  }
}

// Limpiar resaltados del tablero
function clearHighlights() {
  document.querySelectorAll('#sudoku-board td').forEach(cell => {
    cell.classList.remove('highlighted', 'highlighted-block', 'same-number');
  });
}

// Renderizar el tablero en el HTML
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
        if (solution[r][c] === board[r][c]) {
          td.classList.add("prefilled");
        } else {
          td.style.color = "red";
        }
      }
      td.addEventListener("click", () => selectCell(td));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// Renderizar los botones numéricos
function renderButtons() {
  const container = document.getElementById("num-buttons");
  container.innerHTML = "";
  const completedNumbers = checkCompletedNumbers();

  for (let i = 1; i <= 9; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.value = i;
    if (completedNumbers.has(i)) {
      btn.disabled = true;
      btn.classList.add("disabled-btn");
    }
    btn.addEventListener("click", () => placeNumber(i));
    container.appendChild(btn);
  }
}

// Seleccionar una celda
function selectCell(td) {
  if (!gameActive) return;

  if (selectedCell) selectedCell.classList.remove("selected");
  clearHighlights();

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
      if (cell.textContent === cellValue) {
        cell.classList.add("same-number");
      }
    });
    if (selectedCell === td) td.classList.remove("same-number");
  }

  if (selectedCell) {
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
}

// Colocar un número en la celda seleccionada
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
      increaseAttempt();
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

// Verificar qué números están completos
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

// Actualizar el temporizador
function updateTimer() {
  const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
  const seconds = (gameTime % 60).toString().padStart(2, '0');
  document.getElementById('time').textContent = `${minutes}:${seconds}`;
}

// Iniciar el temporizador
function startTimer() {
  stopTimer();
  gameTime = 0;
  updateTimer();
  timerInterval = setInterval(() => {
    gameTime++;
    updateTimer();
  }, 1000);
}

// Detener el temporizador
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Actualizar el contador de intentos
function updateAttempts() {
  document.getElementById('attempts').textContent = `${attempts}/3`;
}

// Incrementar intentos fallidos
function increaseAttempt() {
  attempts++;
  updateAttempts();

  if (attempts >= 3) {
    endGame(false);
  }
}

// Verificar si el tablero está completo
function checkBoardComplete() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

// Finalizar el juego
function endGame(success) {
  gameActive = false;
  stopTimer();

  if (success) {
    alert(`¡Felicidades! Completaste el sudoku en ${document.getElementById('time').textContent}`);
  } else {
    alert(`¡Game Over! Has alcanzado 3 intentos fallidos.`);
  }
}

// Inicializar un nuevo juego
function initGame() {
  const difficulty = document.getElementById("difficulty").value;
  generateBoard(difficulty);
  renderBoard();
  renderButtons();

  // Reiniciar variables
  attempts = 0;
  updateAttempts();
  startTimer();
  gameActive = true;

  // Limpiar selección
  if (selectedCell) {
    selectedCell.classList.remove("selected");
    selectedCell = null;
  }
  clearHighlights();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-game-btn').addEventListener('click', initGame);
  initGame(); // Iniciar juego al cargar
});