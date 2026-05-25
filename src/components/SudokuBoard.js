export default function SudokuBoard({
  grid,
  selectedCell,
  setSelectedCell,
  theme,
  conflicts
}) {
  
  // Helper to check if a cell is related (same row, col, or box) to the selected cell
  const isRelatedCell = (r, c) => {
    if (!selectedCell) return false;
    const { row: selRow, col: selCol } = selectedCell;
    if (r === selRow || c === selCol) return true;
    
    const selBoxRow = Math.floor(selRow / 3);
    const selBoxCol = Math.floor(selCol / 3);
    const cellBoxRow = Math.floor(r / 3);
    const cellBoxCol = Math.floor(c / 3);
    
    return selBoxRow === cellBoxRow && selBoxCol === cellBoxCol;
  };

  // Helper to check if cell shares the same value as the selected cell (for matching highlight)
  const isSameValueSelected = (cellVal) => {
    if (!selectedCell || cellVal === 0) return false;
    const { row: selRow, col: selCol } = selectedCell;
    return grid[selRow][selCol].value === cellVal;
  };

  return (
    <div 
      className={`w-full max-w-[420px] aspect-square rounded-2xl p-1 shadow-2xl overflow-hidden transition-all duration-300 relative ${
        theme === 'dark' 
          ? 'glass-panel-dark' 
          : 'glass-panel-light'
      }`}
    >
      {/* Major Grid Lines divider overlays for a cleaner 3x3 separation */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className={`absolute left-1/3 w-[2.5px] h-full ${theme === 'dark' ? 'bg-sky-400/25' : 'bg-slate-400/35'} -ml-[1.25px]`}></div>
        <div className={`absolute left-2/3 w-[2.5px] h-full ${theme === 'dark' ? 'bg-sky-400/25' : 'bg-slate-400/35'} -ml-[1.25px]`}></div>
        <div className={`absolute top-1/3 h-[2.5px] w-full ${theme === 'dark' ? 'bg-sky-400/25' : 'bg-slate-400/35'} -mt-[1.25px]`}></div>
        <div className={`absolute top-2/3 h-[2.5px] w-full ${theme === 'dark' ? 'bg-sky-400/25' : 'bg-slate-400/35'} -mt-[1.25px]`}></div>
      </div>

      <div className="grid grid-cols-9 h-full w-full relative z-0">
        {grid.map((rowArr, rIndex) =>
          rowArr.map((cell, cIndex) => {
            const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
            const isRelated = isRelatedCell(rIndex, cIndex);
            const isSameVal = isSameValueSelected(cell.value);
            const isConflict = conflicts[rIndex][cIndex];
            
            // Validation error: user placed wrong value versus grid solution
            const isError = !cell.isOriginal && cell.value !== 0 && cell.value !== cell.solvedValue;

            // Clean, minimalist thin cell grid lines
            const borderRight = cIndex === 8 ? '' : (theme === 'dark' ? 'border-r border-white/5' : 'border-r border-slate-250/30');
            const borderBottom = rIndex === 8 ? '' : (theme === 'dark' ? 'border-b border-white/5' : 'border-b border-slate-250/30');

            // Base cell color class based on interactions
            let cellBg = theme === 'dark' ? 'bg-[#0b1329]/15' : 'bg-white/10';
            
            if (isSelected) {
              cellBg = theme === 'dark' ? 'bg-sky-500/35 ring-2 ring-sky-400/50' : 'bg-blue-100/95 ring-2 ring-blue-500/40';
            } else if (isConflict) {
              cellBg = theme === 'dark' ? 'bg-rose-500/20' : 'bg-red-50/90';
            } else if (isSameVal) {
              cellBg = theme === 'dark' ? 'bg-sky-400/15' : 'bg-sky-100/60';
            } else if (isRelated) {
              cellBg = theme === 'dark' ? 'bg-white/5' : 'bg-slate-100/60';
            }

            // Cell text colors
            let fontColor = '';
            if (cell.value !== 0) {
              if (cell.isOriginal) {
                fontColor = theme === 'dark' ? 'text-slate-100 font-bold' : 'text-slate-900 font-bold';
              } else if (isError) {
                fontColor = 'text-rose-500 font-bold';
              } else {
                fontColor = theme === 'dark' ? 'text-sky-400 font-medium' : 'text-blue-600 font-semibold';
              }
            }

            return (
              <button
                key={`${rIndex}-${cIndex}`}
                id={`cell-${rIndex}-${cIndex}`}
                onClick={() => setSelectedCell({ row: rIndex, col: cIndex })}
                className={`h-full w-full aspect-square flex items-center justify-center select-none text-xl sm:text-2xl font-mono focus:outline-none transition-all duration-150 relative ${borderRight} ${borderBottom} ${cellBg} ${fontColor}`}
              >
                {cell.value !== 0 ? cell.value : ''}
                
                {/* Conflict or Error visual badges */}
                {isError && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
                {isConflict && !isError && (
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
