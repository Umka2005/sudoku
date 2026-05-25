import { Difficulty, SudokuGrid, SudokuCell } from '../types';

type Board = number[][];

function getEmptyBoard(): Board {
  return Array(9).fill(null).map(() => Array(9).fill(0));
}

// Checks if placing num at board[row][col] is valid according to Sudoku rules
function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
    if (board[x][col] === num) return false;
    
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(x / 3);
    const boxCol = 3 * Math.floor(col / 3) + (x % 3);
    if (board[boxRow][boxCol] === num) return false;
  }
  return true;
}

// Backtracking solver
function solve(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        // Scramble the candidates to get a different board each time
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

// Generates a puzzle based on Difficulty
export function generatePuzzle(difficulty: Difficulty): { grid: SudokuGrid; solution: Board } {
  const solved = getEmptyBoard();
  solve(solved);

  // Copy the solved configuration
  const solution = solved.map(row => [...row]);

  // Adjust pre-filled ratio based on difficulty
  // Easy: ~40 pre-filled (~41 blanks)
  // Medium: ~30 pre-filled (~51 blanks)
  // Hard: ~21 pre-filled (~60 blanks)
  let blanksCount = 41;
  if (difficulty === 'medium') {
    blanksCount = 51;
  } else if (difficulty === 'hard') {
    blanksCount = 60;
  }

  // Create starting full grid
  const grid: SudokuGrid = [];
  for (let r = 0; r < 9; r++) {
    const rowCells: SudokuCell[] = [];
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

  // Generate blank indices
  const cellPositions = Array.from({ length: 81 }, (_, i) => i);
  // Shuffle positions
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

// Checks if current entered cells violate physical board constraints (duplicate in row/col/box)
export function getDuplicateConflicts(grid: SudokuGrid): boolean[][] {
  const conflicts = Array(9).fill(null).map(() => Array(9).fill(false));

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>(); // val -> lists of columns
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
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

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>(); // val -> list of rows
    for (let r = 0; r < 9; r++) {
      const val = grid[r][c].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
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

  // Check 3x3 boxes
  for (let box = 0; box < 9; box++) {
    const startRow = 3 * Math.floor(box / 3);
    const startCol = 3 * (box % 3);
    const seen = new Map<number, {r: number, c: number}[]>();
    for (let i = 0; i < 9; i++) {
      const r = startRow + Math.floor(i / 3);
      const c = startCol + (i % 3);
      const val = grid[r][c].value;
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push({r, c});
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

// Checks if the grid matches the unique solution perfectly and is complete
export function checkGridCompleted(grid: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0 || grid[r][c].value !== grid[r][c].solvedValue) {
        return false;
      }
    }
  }
  return true;
}
