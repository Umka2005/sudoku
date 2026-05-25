export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'en' | 'ru' | 'uz';
export type Theme = 'light' | 'dark';

export interface SudokuCell {
  row: number;
  col: number;
  value: number;          // Current value in the cell (0 if empty)
  originalValue: number;  // Initial value when the game started (0 if empty)
  solvedValue: number;    // Correct solved value from backtracking
  isOriginal: boolean;    // Flag indicating if this was pre-filled by the level generator
}

export type SudokuGrid = SudokuCell[][];

export interface TranslationSet {
  title: string;
  selectDifficulty: string;
  easy: string;
  medium: string;
  hard: string;
  settings: string;
  language: string;
  theme: string;
  lightTheme: string;
  darkTheme: string;
  bestTime: string;
  timer: string;
  completedTitle: string;
  timeSpent: string;
  mistakes: string;
  newGame: string;
  mainMenu: string;
  restart: string;
  erase: string;
  quitConfirm: string;
  goBack: string;
}

export type Translations = Record<Language, TranslationSet>;
