import { motion } from 'motion/react';
import { X, Globe, Moon, Sun, Check } from 'lucide-react';
import { translations } from '../translations';

export default function SettingsScreen({
  language,
  setLanguage,
  theme,
  setTheme,
  onClose
}) {
  const t = translations[language];

  const languagesList = [
    { code: 'en', label: 'English', desc: 'English' },
    { code: 'ru', label: 'Русский', desc: 'Russian' },
    { code: 'uz', label: "O'zbekcha", desc: 'Uzbek' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-40 flex flex-col p-6 overflow-y-auto"
      style={{
        background: theme === 'dark' ? 'rgba(7, 12, 25, 0.82)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: theme === 'dark' ? '#E2E8F0' : '#1E293B'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          {t.settings}
        </h2>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          id="btn-settings-close"
          className={`p-2 rounded-full border transition-colors ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300' 
              : 'bg-slate-100/60 border-slate-200 hover:bg-slate-200 text-slate-600'
          }`}
          aria-label="Close Settings"
        >
          <X size={20} />
        </motion.button>
      </div>

      <div className="space-y-8 flex-1">
        {/* Language Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
            <Globe size={14} /> {t.language}
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {languagesList.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLanguage(lang.code)}
                  id={`btn-lang-${lang.code}`}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? theme === 'dark'
                        ? 'border-sky-500 bg-sky-500/20 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                        : 'border-blue-600 bg-blue-600/10 text-blue-800 font-semibold shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                      : theme === 'dark'
                      ? 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-300'
                      : 'border-slate-200/50 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-sm font-semibold">{lang.label}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">{lang.desc}</span>
                  </div>
                  {isSelected && (
                    <div className={theme === 'dark' ? 'text-sky-400' : 'text-blue-600'}>
                      <Check size={18} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Theme Toggles */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
            {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />} {t.theme}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme('light')}
              id="btn-theme-light"
              className={`flex flex-col items-center justify-center p-4 rounded-xl border gap-2 transition-all duration-200 ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-600/10 text-blue-800 font-semibold shadow-[0_0_12px_rgba(37,99,235,0.15)]'
                  : theme === 'dark'
                  ? 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                  : 'border-slate-200/50 bg-slate-50/50 text-slate-400 hover:bg-slate-100/50'
              }`}
            >
              <Sun size={20} className={theme === 'light' ? 'text-blue-600' : ''} />
              <span className="text-xs font-semibold">{t.lightTheme}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme('dark')}
              id="btn-theme-dark"
              className={`flex flex-col items-center justify-center p-4 rounded-xl border gap-2 transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-sky-500 bg-sky-500/25 text-sky-300 font-semibold shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'border-slate-200/50 bg-slate-50/50 text-slate-400 hover:bg-slate-100/50'
              }`}
            >
              <Moon size={20} className={theme === 'dark' ? 'text-sky-400' : ''} />
              <span className="text-xs font-semibold">{t.darkTheme}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="mt-auto pt-6 text-center border-t border-dashed border-slate-700/20">
        <p className="text-[10px] font-mono text-slate-400">
          Sudoku Telegram Mini App v1.0.0
        </p>
      </div>
    </motion.div>
  );
}
