/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, RefreshCw, ArrowLeft, Trophy, Clock, AlertTriangle } from 'lucide-react';

import { translations } from './translations.js';
import { generatePuzzle, getDuplicateConflicts, checkGridCompleted } from './utils/sudoku.js';

import SettingsScreen from './components/SettingsScreen.js';
import SudokuBoard from './components/SudokuBoard.js';
import Numpad from './components/Numpad.js';
import CompletionModal from './components/CompletionModal.js';

export default function App() {
  // Locale / UX states
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sudoku_lang') || 'en';
  });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sudoku_theme') || 'dark';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Gamestate states
  const [screen, setScreen] = useState('home');
  const [difficulty, setDifficulty] = useState('easy');
  const [grid, setGrid] = useState([]);
  const [initialGridCopy, setInitialGridCopy] = useState([]); // To support quick restart
  const [selectedCell, setSelectedCell] = useState(null);
  
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Record stats
  const [bestTimes, setBestTimes] = useState({
    easy: null,
    medium: null,
    hard: null
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef(null);

  // Sync state settings to localStorage
  useEffect(() => {
    localStorage.setItem('sudoku_lang', language);
  }, [language]);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem('sudoku_theme', theme);
  }, [theme]);

  // Load best times from localStorage upon start
  useEffect(() => {
    setBestTimes({
      easy: localStorage.getItem('sudoku_best_easy') ? Number(localStorage.getItem('sudoku_best_easy')) : null,
      medium: localStorage.getItem('sudoku_best_medium') ? Number(localStorage.getItem('sudoku_best_medium')) : null,
      hard: localStorage.getItem('sudoku_best_hard') ? Number(localStorage.getItem('sudoku_best_hard')) : null,
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeSpent((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isCompleted]);

  // Start a new game of the specified difficulty
  const handleStartGame = (diff) => {
    setDifficulty(diff);
    const { grid: generatedGrid } = generatePuzzle(diff);
    
    // Deep copies
    const copy1 = JSON.parse(JSON.stringify(generatedGrid));
    const copy2 = JSON.parse(JSON.stringify(generatedGrid));
    
    setGrid(copy1);
    setInitialGridCopy(copy2);
    
    setSelectedCell(null);
    setTimeSpent(0);
    setMistakes(0);
    setIsCompleted(false);
    setIsNewRecord(false);
    setScreen('game');
    setIsPlaying(true);
  };

  // Restarts the same puzzle layout from scratch
  const handleRestartPuzzle = () => {
    const copy = JSON.parse(JSON.stringify(initialGridCopy));
    setGrid(copy);
    setSelectedCell(null);
    setTimeSpent(0);
    setMistakes(0);
    setIsCompleted(false);
    setIsNewRecord(false);
    setIsPlaying(true);
  };

  // Handles inputting a digit to the currently selected cell
  const handleInputDigit = (digit) => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    
    // Original locked cells cannot be edited
    if (cell.isOriginal) return;

    const updatedGrid = [...grid.map(r => [...r])];
    
    // Update the value
    updatedGrid[row][col] = {
      ...cell,
      value: digit
    };

    // If they input an error state (not equal to solved value), we increment mistakes count
    if (digit !== cell.solvedValue) {
      setMistakes((prev) => prev + 1);
    }

    setGrid(updatedGrid);

    // Check completion
    if (checkGridCompleted(updatedGrid)) {
      handleGameWon();
    }
  };

  // Erases the number at the selected cell
  const handleEraseCell = () => {
    if (!selectedCell || isCompleted) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    
    if (cell.isOriginal) return;

    const updatedGrid = [...grid.map(r => [...r])];
    updatedGrid[row][col] = {
      ...cell,
      value: 0
    };
    setGrid(updatedGrid);
  };

  // Key Event Listener for physical computers & desktop viewports
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (screen !== 'game' || isSettingsOpen || isCompleted) return;
      
      // Numbers 1-9
      if (/^[1-9]$/.test(e.key)) {
        handleInputDigit(Number(e.key));
      } 
      // Erase via Backspace or Delete
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleEraseCell();
      }
      // Arrow navigation inside the grid
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (!selectedCell) {
          setSelectedCell({ row: 0, col: 0 });
          return;
        }
        let { row, col } = selectedCell;
        if (e.key === 'ArrowUp') row = (row - 1 + 9) % 9;
        if (e.key === 'ArrowDown') row = (row + 1) % 9;
        if (e.key === 'ArrowLeft') col = (col - 1 + 9) % 9;
        if (e.key === 'ArrowRight') col = (col + 1) % 9;
        setSelectedCell({ row, col });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [screen, selectedCell, isSettingsOpen, isCompleted, grid]);

  // Handles completion & records evaluation
  const handleGameWon = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    
    const previousBest = bestTimes[difficulty];
    if (previousBest === null || timeSpent < previousBest) {
      // It's a brand new record!
      localStorage.setItem(`sudoku_best_${difficulty}`, timeSpent.toString());
      setBestTimes((prev) => ({
        ...prev,
        [difficulty]: timeSpent
      }));
      setIsNewRecord(true);
    }
  };

  // Return to menu confirmation
  const handleQuitGame = () => {
    if (window.confirm(translations[language].quitConfirm)) {
      setIsPlaying(false);
      setScreen('home');
    }
  };

  const t = translations[language];
  const conflicts = grid.length > 0 ? getDuplicateConflicts(grid) : [];

  // Active theme properties
  const isDark = theme === 'dark';
  const appStyle = {
    backgroundColor: isDark ? '#020617' : '#F8FAFC',
    color: isDark ? '#F1F5F9' : '#0F172A',
  };

  // Format seconds to mm:ss helper
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden transition-colors duration-300"
      style={appStyle}
    >
      {/* Absolute Ambient Pulsing Blur (aesthetic visual background) */}
      <div 
        className="sudoku-glow top-[-80px] left-[-80px] bg-blue-500/20" 
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="sudoku-glow bottom-[-80px] right-[-80px] bg-sky-500/20" 
        style={{ animationDelay: '4s' }}
      />

      {/* Screen Wrapper */}
      <div className="relative z-10 w-full max-w-md mx-auto flex-1 flex flex-col p-4">
        
        {/* TOP STATUS NAVIGATION BAR */}
        <header className="flex items-center justify-between py-2 mb-4 w-full">
          {screen === 'game' ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleQuitGame}
              id="btn-nav-quit"
              className={`p-2.5 rounded-xl flex items-center gap-1.5 border transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                  : 'bg-white/65 border-slate-250/30 text-slate-650 hover:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
              }`}
            >
              <ArrowLeft size={16} />
              <span className="text-xs font-semibold">{t.goBack}</span>
            </motion.button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-display font-extrabold text-xl shadow-lg shadow-blue-500/20">
                S
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                {t.title}
              </span>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSettingsOpen(true)}
            id="btn-nav-settings"
            className={`p-2.5 rounded-xl border transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                : 'bg-white/65 border-slate-250/30 text-slate-650 hover:bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
            }`}
          >
            <Settings size={18} />
          </motion.button>
        </header>

        {/* --- MAIN GAME INTERFACES CONTROLS --- */}
        <main className="flex-1 flex flex-col justify-center w-full">
          <AnimatePresence mode="wait">
            
            {/* 1. HOME SCREEN */}
            {screen === 'home' && (
              <motion.div
                key="home-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8 py-4 flex flex-col items-center justify-center my-auto w-full"
              >
                {/* Hero Logo / Emblem */}
                <div className="text-center space-y-2">
                  <div className="inline-flex relative mb-2">
                    {/* Beautiful Sudoku Visual Art grid */}
                    <div className="grid grid-cols-2 gap-1 p-2 border-2 border-blue-500/80 rounded-2xl w-16 h-16 items-center justify-center bg-blue-500/5">
                      <span className="text-blue-500 font-mono text-center text-lg font-bold">5</span>
                      <span className="text-sky-400 font-mono text-center text-lg font-medium">3</span>
                      <span className="text-sky-400 font-mono text-center text-lg font-medium">9</span>
                      <span className="text-blue-500 font-mono text-center text-lg font-bold">7</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-display font-black tracking-tight bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-xs text-slate-400 font-mono tracking-wide">
                    {t.selectDifficulty}
                  </p>
                </div>

                {/* Difficulty options */}
                <div className="w-full space-y-3 max-w-[320px]">
                  {difficulties.map((level) => {
                    const best = bestTimes[level];
                    let label = t.easy;
                    let glassClasses = '';
                    
                    if (isDark) {
                      if (level === 'easy') {
                        label = t.easy;
                        glassClasses = 'bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.18)]';
                      } else if (level === 'medium') {
                        label = t.medium;
                        glassClasses = 'bg-sky-500/10 backdrop-blur-md border border-sky-500/25 hover:bg-sky-500/20 text-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.18)]';
                      } else {
                        label = t.hard;
                        glassClasses = 'bg-rose-500/10 backdrop-blur-md border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.18)]';
                      }
                    } else {
                      if (level === 'easy') {
                        label = t.easy;
                        glassClasses = 'bg-emerald-50/60 backdrop-blur-md border border-emerald-250/30 hover:bg-emerald-100/70 text-emerald-800 hover:shadow-[0_6px_20px_rgba(16,185,129,0.05)]';
                      } else if (level === 'medium') {
                        label = t.medium;
                        glassClasses = 'bg-sky-50/60 backdrop-blur-md border border-sky-250/30 hover:bg-sky-100/70 text-sky-800 hover:shadow-[0_6px_20px_rgba(56,189,248,0.05)]';
                      } else {
                        label = t.hard;
                        glassClasses = 'bg-rose-50/60 backdrop-blur-md border border-rose-250/30 hover:bg-rose-100/70 text-rose-800 hover:shadow-[0_6px_20px_rgba(244,63,94,0.05)]';
                      }
                    }

                    return (
                      <motion.button
                        key={level}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleStartGame(level)}
                        id={`btn-diff-${level}`}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${glassClasses}`}
                      >
                        <div>
                          <span className="text-lg font-display font-bold block">{label}</span>
                          {best !== null && (
                            <span className="text-[10px] font-mono uppercase tracking-wider opacity-85 flex items-center gap-1 mt-1">
                              <Trophy size={11} className="inline text-amber-400" /> {t.bestTime}: {formatTime(best)}
                            </span>
                          )}
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          isDark ? 'bg-white/5' : 'bg-black/5'
                        }`}>
                          →
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. GAME SCREEN */}
            {screen === 'game' && (
              <motion.div
                key="game-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 my-auto flex flex-col items-center w-full"
              >
                {/* Stats / Timer / Info Panel */}
                <div className="w-full max-w-[420px] flex items-center justify-between px-1.5 text-xs font-mono text-slate-400 font-semibold select-none">
                  {/* Timer */}
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border border-slate-200/50'
                  }`}>
                    <Clock size={13} className="text-sky-400" />
                    <span>{t.timer}:</span>
                    <span className="font-bold text-slate-200 dark:text-slate-100">{formatTime(timeSpent)}</span>
                  </div>

                  {/* Mistakes count */}
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
                    mistakes > 0
                      ? isDark ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-rose-50 border border-rose-200 text-rose-600'
                      : isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border border-slate-200/50'
                  }`}>
                    {mistakes > 0 && <AlertTriangle size={13} className="animate-pulse" />}
                    <span>{t.mistakes}:</span>
                    <span className="font-bold">{mistakes}</span>
                  </div>
                </div>

                {/* Interactive Sudoku Grid */}
                {grid.length > 0 && (
                  <SudokuBoard
                    grid={grid}
                    selectedCell={selectedCell}
                    setSelectedCell={setSelectedCell}
                    theme={theme}
                    conflicts={conflicts}
                  />
                )}

                {/* Quick Restart & Utility Controls */}
                <div className="flex items-center justify-center gap-4 py-1 select-none">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRestartPuzzle}
                    id="btn-action-restart"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' 
                        : 'bg-white/60 border-slate-200/50 text-slate-650 hover:bg-slate-100/50'
                    }`}
                  >
                    <RefreshCw size={13} />
                    {t.restart}
                  </motion.button>
                </div>

                {/* Numpad input controller */}
                <Numpad
                  onNumberSelect={handleInputDigit}
                  onErase={handleEraseCell}
                  theme={theme}
                  language={language}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Settings Panel Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsScreen
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Complete Victory Screen Overlay */}
      <AnimatePresence>
        {isCompleted && (
          <CompletionModal
            timeSpent={timeSpent}
            difficulty={difficulty}
            bestTime={bestTimes[difficulty]}
            isNewRecord={isNewRecord}
            onNewGame={() => handleStartGame(difficulty)}
            onMainMenu={() => {
              setIsCompleted(false);
              setScreen('home');
            }}
            theme={theme}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
