import { motion } from 'motion/react';
import { Delete } from 'lucide-react';
import { translations } from '../translations';

export default function Numpad({
  onNumberSelect,
  onErase,
  theme,
  language
}) {
  const t = translations[language];

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="w-full max-w-[420px] mx-auto space-y-3 px-1 select-none">
      {/* 1-9 Numbers Grid */}
      <div className="grid grid-cols-9 gap-1.5 justify-center">
        {numbers.map((num) => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onNumberSelect(num)}
            id={`numpad-btn-${num}`}
            className={`aspect-square rounded-xl text-xl sm:text-2xl font-mono font-bold flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-white/5 backdrop-blur-md border border-white/10 text-sky-400 hover:bg-sky-500/30 hover:border-sky-500/40'
                : 'bg-white/45 backdrop-blur-md border border-slate-200/60 text-blue-600 hover:bg-blue-50 hover:border-blue-200'
            }`}
          >
            {num}
          </motion.button>
        ))}
      </div>

      {/* Erase Control */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onErase}
          id="numpad-btn-erase"
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all w-full max-w-[200px] border ${
            theme === 'dark'
              ? 'bg-rose-500/10 backdrop-blur-md border border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
              : 'bg-rose-50/70 backdrop-blur-md border border-rose-100/80 text-rose-600 hover:bg-rose-100/80'
          }`}
        >
          <Delete size={16} />
          {t.erase}
        </motion.button>
      </div>
    </div>
  );
}
