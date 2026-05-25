/**
 * Sudoku Game Logic and DOM controller
 * Pure Vanilla JavaScript implementation
 */

// --- 1. LOCALIZATION SYSTEM ---
const translations = {
  en: {
    title: "Sudoku",
    selectDifficulty: "Choose Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    bestTime: "Best Record",
    timer: "Time",
    completedTitle: "Completed!",
    timeSpent: "Time Spent",
    mistakes: "Mistakes",
    newGame: "New Game",
    mainMenu: "Main Menu",
    restart: "Restart",
    erase: "Erase",
    quitConfirm: "Are you sure you want to quit the current game?",
    goBack: "Go Back"
  },
  ru: {
    title: "Судоку",
    selectDifficulty: "Выбрать сложность",
    easy: "Легко",
    medium: "Средне",
    hard: "Сложно",
    settings: "Настройки",
    language: "Язык",
    theme: "Тема",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    bestTime: "Лучший рекорд",
    timer: "Время",
    completedTitle: "Победа!",
    timeSpent: "Затраченное время",
    mistakes: "Ошибки",
    newGame: "Новая игра",
    mainMenu: "Главное меню",
    restart: "Заново",
    erase: "Стереть",
    quitConfirm: "Вы уверены, что хотите выйти из текущей игры?",
    goBack: "Назад"
  },
  uz: {
    title: "Sudoku",
    selectDifficulty: "Qiyinchilikni tanlang",
    easy: "Oson",
    medium: "O'rtacha",
    hard: "Qiyin",
    settings: "Sozalamalar",
    language: "Til",
    theme: "Mavzu",
    lightTheme: "Yorug'",
    darkTheme: "Tungi",
    bestTime: "Eng yaxshi natija",
    timer: "Vaqt",
    completedTitle: "Tugallandi!",
    timeSpent: "Sarflangan vaqt",
    mistakes: "Xatolar",
    newGame: "Yangi o'yin",
    mainMenu: "Asosiy menyu",
    restart: "Qayta boshlash",
    erase: "O'chirish",
    quitConfirm: "Hozirgi o'yinni tark etishni xohlaysizmi?",
    goBack: "Orqaga"
  }
};

// --- 2. GAME ENGINE CONFIGURATION AND GENERATOR ---
function getEmptyBoard() {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

function isValid(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
    if (board[x][col] === num) return false;
    
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(x / 3);
    const boxCol = 3 * Math.floor(col / 3) + (x % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(difficulty) {
  const solved = getEmptyBoard();
  solve(solved);
  const solution = solved.map(row => [...row]);

  let blanksCount = 41;
  if (difficulty === 'medium') {
    blanksCount = 51;
  } else if (difficulty === 'hard') {
    blanksCount = 60;
  }

  const grid = [];
  for (let r = 0; r < 9; r++) {
    const rowCells = [];
    for (let c = 0; c < 9; c++) {
      rowCells.push({
        row: r,
        col: c,
        value: solution[r][c],
        originalValue: solution[r][c],
        solvedValue: solution[r][c],
        isOriginal: true
      });
    }
    grid.push(rowCells);
  }

  const cellPositions = Array.from({ length: 81 }, (_, i) => i);
  cellPositions.sort(() => Math.random() - 0.5);

  let blanksCreated = 0;
  for (const pos of cellPositions) {
    if (blanksCreated >= blanksCount) break;
    const r = Math.floor(pos / 9);
    const c = pos % 9;

    grid[r][c].value = 0;
    grid[r][c].originalValue = 0;
    grid[r][c].isOriginal = false;
    blanksCreated++;
  }

  return { grid, solution };
}

function getDuplicateConflicts(grid) {
  const conflicts = Array(9).fill(null).map(() => Array(9).fill(false));

  // Rows check
  for (let r = 0; r < 9; r++) {
    const seen = new Map();
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val).push(c);
      }
    }
    for (const cols of seen.values()) {
      if (cols.length > 1) {
        for (const c of cols) {
          conflicts[r][c] = true;
        }
      }
    }
  }

  // Columns check
  for (let c = 0; c < 9; c++) {
    const seen = new Map();
    for (let r = 0; r < 9; r++) {
      const val = grid[r][c].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val).push(r);
      }
    }
    for (const rows of seen.values()) {
      if (rows.length > 1) {
        for (const r of rows) {
          conflicts[r][c] = true;
        }
      }
    }
  }

  // Box check
  for (let box = 0; box < 9; box++) {
    const startRow = 3 * Math.floor(box / 3);
    const startCol = 3 * (box % 3);
    const seen = new Map();
    for (let i = 0; i < 9; i++) {
      const r = startRow + Math.floor(i / 3);
      const c = startCol + (i % 3);
      const val = grid[r][c].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val).push({r, c});
      }
    }
    for (const items of seen.values()) {
      if (items.length > 1) {
        for (const item of items) {
          conflicts[item.r][item.c] = true;
        }
      }
    }
  }

  return conflicts;
}

function checkGridCompleted(grid) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0 || grid[r][c].value !== grid[r][c].solvedValue) {
        return false;
      }
    }
  }
  return true;
}

// --- 3. STATE AND STATE ACTIONS ---
const state = {
  language: localStorage.getItem('sudoku_lang') || 'en',
  theme: localStorage.getItem('sudoku_theme') || 'dark',
  screen: 'home', // 'home' or 'game'
  difficulty: 'easy',
  grid: [],
  initialGridCopy: [],
  selectedCell: null, // { row, col }
  timeSpent: 0,
  isPlaying: false,
  isCompleted: false,
  mistakes: 0,
  bestTimes: {
    easy: localStorage.getItem('sudoku_best_easy') ? Number(localStorage.getItem('sudoku_best_easy')) : null,
    medium: localStorage.getItem('sudoku_best_medium') ? Number(localStorage.getItem('sudoku_best_medium')) : null,
    hard: localStorage.getItem('sudoku_best_hard') ? Number(localStorage.getItem('sudoku_best_hard')) : null,
  },
  isNewRecord: false,
};

let timerInterval = null;

// --- 4. FORMATTERS & HELPERS ---
function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, '0');
  const sec = (seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

// Check relative distance (row, col or box) to highlight matching context
function isRelated(r1, c1, r2, c2) {
  if (r1 === r2 || c1 === c2) return true;
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

// --- 5. DATA RENDERING AND EVENTS ---
function updateTheme() {
  const htmlEl = document.documentElement;
  if (state.theme === 'dark') {
    htmlEl.classList.add('dark');
    document.body.style.backgroundColor = '#020617';
    document.body.style.color = '#F1F5F9';
  } else {
    htmlEl.classList.remove('dark');
    document.body.style.backgroundColor = '#F8FAFC';
    document.body.style.color = '#0F172A';
  }

  // Update classes on custom cards/buttons
  const glows = document.querySelectorAll('.sudoku-glow');
  glows.forEach((g) => {
    g.style.display = state.theme === 'dark' ? 'block' : 'none';
  });

  // Highlight buttons inside Settings screen
  const sunBtn = document.getElementById('btn-theme-light');
  const moonBtn = document.getElementById('btn-theme-dark');
  if (sunBtn && moonBtn) {
    if (state.theme === 'light') {
      sunBtn.className = "flex flex-col items-center justify-center p-4 rounded-xl border gap-2 transition-all duration-200 border-blue-600 bg-blue-600/10 text-blue-800 font-semibold shadow-[0_0_12px_rgba(37,99,235,0.15)]";
      moonBtn.className = "flex flex-col items-center justify-center p-4 rounded-xl border gap-2 transition-all duration-200 border-slate-200/50 bg-slate-50/50 text-slate-400 hover:bg-slate-100/50";
    } else {
      sunBtn.className = "flex flex-col items-center justify-center p-4 rounded-xl border gap-2 transition-all duration-200 border-white/5 bg-white/5 text-slate-400 hover:bg-white/10";
      moonBtn.className = "flex flex-col items-center justify-center p-4 rounded-xl border gap-2 transition-all duration-200 border-sky-500 bg-sky-500/25 text-sky-300 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.25)]";
    }
  }

  renderScreen();
}

function updateLanguage(langCode) {
  state.language = langCode;
  localStorage.setItem('sudoku_lang', langCode);
  
  // Update translation attributes
  const t = translations[langCode];
  document.querySelectorAll('[data-trans]').forEach((el) => {
    const key = el.getAttribute('data-trans');
    if (t[key]) {
      if (el.tagName === 'INPUT' && el.type === 'button') {
        el.value = t[key];
      } else {
        el.innerHTML = t[key];
      }
    }
  });

  // Re-render difficulty choices list
  renderScoresList();
  renderScreen();
  
  // Recalculate dynamic titles
  const currentDiffEl = document.getElementById('completed-difficulty-label');
  if (currentDiffEl) {
    currentDiffEl.innerText = t[state.difficulty] || state.difficulty;
  }
}

// Generate the best record list items on start screen
function renderScoresList() {
  const t = translations[state.language];
  const listContainer = document.getElementById('difficulty-options');
  if (!listContainer) return;

  const levels = ['easy', 'medium', 'hard'];
  let html = '';

  levels.forEach((level) => {
    const best = state.bestTimes[level];
    let label = t[level];
    let glassClasses = '';

    if (state.theme === 'dark') {
      if (level === 'easy') {
        glassClasses = 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.18)]';
      } else if (level === 'medium') {
        glassClasses = 'bg-sky-500/10 border-sky-500/25 hover:bg-sky-500/20 text-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.18)]';
      } else {
        glassClasses = 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.18)]';
      }
    } else {
      if (level === 'easy') {
        glassClasses = 'bg-emerald-50/60 border-emerald-200/50 hover:bg-emerald-100/70 text-emerald-800 hover:shadow-[0_6px_20px_rgba(16,185,129,0.05)]';
      } else if (level === 'medium') {
        glassClasses = 'bg-sky-50/60 border-sky-200/50 hover:bg-sky-100/70 text-sky-800 hover:shadow-[0_6px_20px_rgba(56,189,248,0.05)]';
      } else {
        glassClasses = 'bg-rose-50/60 border-rose-200/50 hover:bg-rose-100/70 text-rose-800 hover:shadow-[0_6px_20px_rgba(244,63,94,0.05)]';
      }
    }

    const bestText = best !== null 
      ? `<span class="text-[10px] font-mono uppercase tracking-wider opacity-85 flex items-center gap-1 mt-1">
          <i data-lucide="trophy" class="inline w-3 h-3 text-amber-500"></i> ${t.bestTime}: ${formatTime(best)}
         </span>`
      : '';

    html += `
      <button onclick="startGame('${level}')" class="w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-smooth dynamic-theme-btn ${glassClasses}">
        <div>
          <span class="text-lg font-display font-bold block">${label}</span>
          ${bestText}
        </div>
        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-black/5 dark:bg-white/5">
          →
        </div>
      </button>
    `;
  });

  listContainer.innerHTML = html;
  lucide.createIcons();
}

// Start Game Core Action
window.startGame = function(diff) {
  state.difficulty = diff;
  const { grid: generatedGrid } = generatePuzzle(diff);

  state.grid = JSON.parse(JSON.stringify(generatedGrid));
  state.initialGridCopy = JSON.parse(JSON.stringify(generatedGrid));

  state.selectedCell = null;
  state.timeSpent = 0;
  state.mistakes = 0;
  state.isCompleted = false;
  state.isNewRecord = false;
  state.screen = 'game';
  state.isPlaying = true;

  // Toggle navigation button state
  document.getElementById('nav-left-bar').innerHTML = `
    <button onclick="quitGame()" class="p-2.5 rounded-xl flex items-center gap-1.5 border transition-smooth bg-white/5 dark:bg-white/5 border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
      <i data-lucide="arrow-left" class="w-4 h-4"></i>
      <span class="text-xs font-semibold" data-trans="goBack">${translations[state.language].goBack}</span>
    </button>
  `;

  // Clear modal and open layout
  document.getElementById('completion-modal').classList.add('hidden');
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');

  startTimer();
  renderScreen();
};

// Quit Game Action
window.quitGame = function() {
  const quitMsg = translations[state.language].quitConfirm;
  if (confirm(quitMsg)) {
    stopTimer();
    state.isPlaying = false;
    state.screen = 'home';
    state.selectedCell = null;

    // Restore Home Header back
    const t = translations[state.language];
    document.getElementById('nav-left-bar').innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-lg shadow-blue-500/20">
          S
        </div>
        <span class="text-2xl font-display font-bold bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent" data-trans="title">
          ${t.title}
        </span>
      </div>
    `;

    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    renderScoresList();
  }
};

// Start clock interval
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    state.timeSpent += 1;
    const timerDisplay = document.getElementById('timer-value');
    if (timerDisplay) {
      timerDisplay.innerText = formatTime(state.timeSpent);
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Reset Game layout with identical puzzles layout
window.restartPuzzle = function() {
  state.grid = JSON.parse(JSON.stringify(state.initialGridCopy));
  state.selectedCell = null;
  state.timeSpent = 0;
  state.mistakes = 0;
  state.isCompleted = false;
  state.isNewRecord = false;
  state.isPlaying = true;

  startTimer();
  renderScreen();
};

// Selection of active cell
window.selectCell = function(r, c) {
  if (state.isCompleted) return;
  state.selectedCell = { row: r, col: c };
  renderScreen();
};

// Direct digit input selection from numpad or physical keyboard keys
window.inputDigit = function(digit) {
  if (!state.selectedCell || state.isCompleted) return;
  const { row, col } = state.selectedCell;
  const cell = state.grid[row][col];

  // Original clues cannot be modified
  if (cell.isOriginal) return;

  // Insert value
  state.grid[row][col].value = digit;

  // Increment error tracker if input digit was wrong
  if (digit !== cell.solvedValue) {
    state.mistakes += 1;
  }

  // Update layout board and badges
  renderScreen();

  // Test full completeness validation
  if (checkGridCompleted(state.grid)) {
    gameWon();
  }
};

// Erasing the cells
window.eraseCell = function() {
  if (!state.selectedCell || state.isCompleted) return;
  const { row, col } = state.selectedCell;
  const cell = state.grid[row][col];

  if (cell.isOriginal) return;

  state.grid[row][col].value = 0;
  renderScreen();
};

// Completion Action Overlay Trigger
function gameWon() {
  stopTimer();
  state.isPlaying = false;
  state.isCompleted = true;

  const previousBest = state.bestTimes[state.difficulty];
  if (previousBest === null || state.timeSpent < previousBest) {
    localStorage.setItem(`sudoku_best_${state.difficulty}`, state.timeSpent.toString());
    state.bestTimes[state.difficulty] = state.timeSpent;
    state.isNewRecord = true;
  }

  // Display winning completion visual popup modal dialog
  const t = translations[state.language];
  document.getElementById('completed-difficulty-label').innerText = t[state.difficulty] || state.difficulty;
  document.getElementById('modal-time-spent').innerText = formatTime(state.timeSpent);
  document.getElementById('modal-best-time').innerText = state.bestTimes[state.difficulty] ? formatTime(state.bestTimes[state.difficulty]) : '--:--';

  const recordBadge = document.getElementById('modal-record-badge');
  if (state.isNewRecord) {
    recordBadge.classList.remove('hidden');
    document.getElementById('modal-trophy-badge').classList.remove('hidden');
  } else {
    recordBadge.classList.add('hidden');
    document.getElementById('modal-trophy-badge').classList.add('hidden');
  }

  document.getElementById('completion-modal').classList.remove('hidden');
}

// Main screen controller rendering grid tiles, layouts and interactions
function renderScreen() {
  const isDark = state.theme === 'dark';
  const t = translations[state.language];

  // If in game view, draw Sudoku board
  if (state.screen === 'game' && state.grid.length > 0) {
    // Render mistakes tracker
    const mistakesContainer = document.getElementById('mistakes-container');
    const mistakesCount = document.getElementById('mistakes-count');
    mistakesCount.innerText = state.mistakes;

    if (state.mistakes > 0) {
      if (isDark) {
        mistakesContainer.className = "flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400";
      } else {
        mistakesContainer.className = "flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-rose-50 border-rose-200 text-rose-600";
      }
    } else {
      mistakesContainer.className = `flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-200/50'
      }`;
    }

    // Render timer block theme
    const timerContainer = document.getElementById('timer-container');
    timerContainer.className = `flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
      isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-200/50'
    }`;
    document.getElementById('timer-value').innerText = formatTime(state.timeSpent);

    // Render utility button theme
    const restartBtn = document.getElementById('btn-action-restart');
    restartBtn.className = `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-smooth ${
      isDark 
        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
        : 'bg-white/60 border-slate-200/50 text-slate-650 hover:bg-slate-100/50'
    }`;

    // Render active Numpad buttons themes
    const numButtons = document.querySelectorAll('.numpad-btn');
    numButtons.forEach((btn) => {
      const isEraseBtn = btn.id === 'numpad-btn-erase';
      if (isEraseBtn) {
        btn.className = `numpad-btn flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-smooth w-full max-w-[200px] border ${
          isDark
            ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
            : 'bg-rose-50/70 border-rose-100/80 text-rose-600 hover:bg-rose-100/80'
        }`;
      } else {
        btn.className = `numpad-btn aspect-square rounded-xl text-xl sm:text-2xl font-mono font-bold flex items-center justify-center transition-smooth ${
          isDark
            ? 'bg-white/5 border border-white/10 text-sky-400 hover:bg-sky-500/30 hover:border-sky-500/40'
            : 'bg-white/45 border border-slate-200/60 text-blue-600 hover:bg-blue-50 hover:border-blue-200'
        }`;
      }
    });

    // Building Sudoku Board layout grid
    const conflicts = getDuplicateConflicts(state.grid);
    const boardPanel = document.getElementById('sudoku-board-container');
    
    // Board panel theme glass effects
    boardPanel.className = `w-full max-w-[420px] aspect-square rounded-2xl p-1 shadow-2xl overflow-hidden transition-smooth relative ${
      isDark ? 'glass-panel-dark' : 'glass-panel-light'
    }`;

    // Board overlays configuration divider
    const gridLinesOverlay = boardPanel.querySelector('.lines-overlay');
    gridLinesOverlay.className = "absolute inset-0 pointer-events-none z-10 lines-overlay";
    const dividingLines = gridLinesOverlay.querySelectorAll('div');
    dividingLines.forEach((line) => {
      line.style.backgroundColor = isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(148, 163, 184, 0.35)';
    });

    // Render cells elements
    const gridElements = document.getElementById('sudoku-cells-grid');
    gridElements.innerHTML = '';

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = state.grid[r][c];
        const isSelected = state.selectedCell?.row === r && state.selectedCell?.col === c;
        const hasSameVal = state.selectedCell ? (state.grid[state.selectedCell.row][state.selectedCell.col].value === cell.value && cell.value !== 0) : false;
        const isRel = state.selectedCell ? isRelated(r, c, state.selectedCell.row, state.selectedCell.col) : false;
        const isConflict = conflicts[r][c];
        const isError = !cell.isOriginal && cell.value !== 0 && cell.value !== cell.solvedValue;

        // Thin borders separation configuration
        const borderRight = c === 8 ? '' : (isDark ? 'border-r border-white/5' : 'border-r border-slate-250/30');
        const borderBottom = r === 8 ? '' : (isDark ? 'border-b border-white/5' : 'border-b border-slate-250/30');

        // Layout Background selection
        let bgStyle = isDark ? 'bg-[#0b1329]/15' : 'bg-white/10';
        if (isSelected) {
          bgStyle = isDark ? 'bg-sky-500/35 ring-2 ring-sky-400/50' : 'bg-blue-100/95 ring-2 ring-blue-500/40 z-10'; // Keep active elements top layer
        } else if (isConflict) {
          bgStyle = isDark ? 'bg-rose-500/20' : 'bg-red-50/90';
        } else if (hasSameVal) {
          bgStyle = isDark ? 'bg-sky-400/15' : 'bg-sky-100/60';
        } else if (isRel) {
          bgStyle = isDark ? 'bg-white/5' : 'bg-slate-100/60';
        }

        // Color typography settings based on digits state
        let textColor = '';
        if (cell.value !== 0) {
          if (cell.isOriginal) {
            textColor = isDark ? 'text-slate-100 font-bold' : 'text-slate-900 font-bold';
          } else if (isError) {
            textColor = 'text-rose-500 font-bold';
          } else {
            textColor = isDark ? 'text-sky-400 font-medium' : 'text-blue-600 font-semibold';
          }
        }

        // Build red/yellow bottom badge alert circles
        let pinBadge = '';
        if (isError) {
          pinBadge = '<span class="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>';
        } else if (isConflict && !isError) {
          pinBadge = '<span class="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500"></span>';
        }

        const cellBtn = document.createElement('button');
        cellBtn.id = `cell-${r}-${c}`;
        cellBtn.onclick = () => selectCell(r, c);
        cellBtn.className = `h-full w-full aspect-square flex items-center justify-center select-none text-xl sm:text-2xl font-mono focus:outline-none transition-smooth relative ${borderRight} ${borderBottom} ${bgStyle} ${textColor}`;
        cellBtn.innerHTML = `${cell.value !== 0 ? cell.value : ''}${pinBadge}`;
        
        gridElements.appendChild(cellBtn);
      }
    }
  }

  // Highlights on settings options screen states
  const langButtons = document.querySelectorAll('.lang-select-btn');
  langButtons.forEach((btn) => {
    const isSelected = btn.getAttribute('data-lang') === state.language;
    if (isSelected) {
      btn.className = `lang-select-btn flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-smooth w-full ${
        isDark
          ? 'border-sky-500 bg-sky-500/20 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
          : 'border-blue-600 bg-blue-600/10 text-blue-800 font-semibold shadow-[0_0_15px_rgba(37,99,235,0.15)]'
      }`;
      btn.querySelector('.checked-mark').classList.remove('hidden');
    } else {
      btn.className = `lang-select-btn flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-smooth w-full ${
        isDark
          ? 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300'
          : 'border-slate-200/50 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700'
      }`;
      btn.querySelector('.checked-mark').classList.add('hidden');
    }
  });

  lucide.createIcons();
}

// Settings Overlay slide interactions
window.toggleSettings = function(openState) {
  const panel = document.getElementById('settings-screen');
  const isDark = state.theme === 'dark';

  if (openState) {
    // Select styling theme
    panel.style.background = isDark ? 'rgba(7, 12, 25, 0.82)' : 'rgba(255, 255, 255, 0.85)';
    panel.style.color = isDark ? '#E2E8F0' : '#1E293B';
    panel.classList.remove('hidden');
    // Force active theme toggles selection
    updateTheme();
  } else {
    panel.classList.add('hidden');
  }
};

// Start modal actions
window.modalNewGame = function() {
  document.getElementById('completion-modal').classList.add('hidden');
  startGame(state.difficulty);
};

window.modalMainMenu = function() {
  document.getElementById('completion-modal').classList.add('hidden');
  state.isPlaying = false;
  state.screen = 'home';
  state.selectedCell = null;

  // Restore main header layout back
  const t = translations[state.language];
  document.getElementById('nav-left-bar').innerHTML = `
    <div class="flex items-center gap-2.5">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-lg shadow-blue-500/20">
        S
      </div>
      <span class="text-2xl font-display font-bold bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent" data-trans="title">
        ${t.title}
      </span>
    </div>
  `;

  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('home-screen').classList.remove('hidden');
  renderScoresList();
};

// --- 6. KEYBOARD EVENT LISTENER SUPPORT ON COMPUTER VIEWS ---
window.addEventListener('keydown', (e) => {
  if (state.screen !== 'game' || state.isCompleted) return;

  const isSettingsOpen = !document.getElementById('settings-screen').classList.contains('hidden');
  if (isSettingsOpen) return;

  // Numbers 1-9 input
  if (/^[1-9]$/.test(e.key)) {
    inputDigit(Number(e.key));
  }
  // Backspace/Delete coordinates erase action
  else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    eraseCell();
  }
  // Cell arrow keys navigation controllers
  else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
    if (!state.selectedCell) {
      selectCell(0, 0);
      return;
    }
    let { row, col } = state.selectedCell;
    if (e.key === 'ArrowUp') row = (row - 1 + 9) % 9;
    if (e.key === 'ArrowDown') row = (row + 1) % 9;
    if (e.key === 'ArrowLeft') col = (col - 1 + 9) % 9;
    if (e.key === 'ArrowRight') col = (col + 1) % 9;
    selectCell(row, col);
  }
});

// App configuration setup init trigger
document.addEventListener('DOMContentLoaded', () => {
  updateLanguage(state.language);
  updateTheme();
  renderScoresList();
});
