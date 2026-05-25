import { motion } from 'motion/react';
import { Trophy, Home, Award } from 'lucide-react';
import { translations } from '../translations.js';

export default function CompletionModal({
  timeSpent,
  difficulty,
  bestTime,
  isNewRecord,
  onNewGame,
  onMainMenu,
  theme,
  language
}) {
  const t = translations[language];

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getDifficultyLabel = (diff) => {
    if (diff === 'easy') return t.easy;
    if (diff === 'medium') return t.medium;
    return t.hard;
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180 }}
        className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-3xl relative overflow-hidden ${
          isDark 
            ? 'glass-panel-dark text-slate-100' 
            : 'glass-panel-light text-slate-800'
        }`}
      >
        {/* Trophy Illustration */}
        <div className="relative inline-flex items-center justify-center p-5 bg-amber-500/10 rounded-full text-amber-500 mb-4">
          <motion.div
            animate={{ 
               rotate: [0, -10, 10, -10, 10, 0],
               scale: [1, 1.1, 1, 1.1, 1] 
            }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 1 }}
          >
            <Trophy size={48} />
          </motion.div>
          {isNewRecord && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full text-[10px] font-bold uppercase tracking-wider scale-110 shadow-lg border-2 border-slate-950 animate-bounce">
              <Award size={18} />
            </span>
          )}
        </div>

        {/* Header Title */}
        <h3 className="text-3xl font-display font-bold tracking-tight mb-1 text-amber-500">
          {t.completedTitle}
        </h3>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6">
          {getDifficultyLabel(difficulty)}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Time spent */}
          <div className={`p-4 rounded-2xl flex flex-col items-center justify-center border ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50/70 border-slate-100/50'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              {t.timeSpent}
            </span>
            <span className="text-2xl font-mono font-bold text-sky-400">
              {formatTime(timeSpent)}
            </span>
          </div>

          {/* Best Record */}
          <div className={`p-4 rounded-2xl flex flex-col items-center justify-center border ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50/70 border-slate-100/50'
          }`}>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              {t.bestTime}
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-400">
              {bestTime ? formatTime(bestTime) : '--:--'}
            </span>
          </div>
        </div>

        {isNewRecord && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
          >
            ✨ New Best Time Record! ✨
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNewGame}
            id="btn-modal-newgame"
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-colors ${
              isDark 
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {t.newGame}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onMainMenu}
            id="btn-modal-mainmenu"
            className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide border transition-all flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                : 'bg-slate-100/50 border-slate-200 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Home size={16} />
            {t.mainMenu}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
