import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt } from 'react-icons/fa';

export const CalendarWidget = ({ onQuickAdd, onViewDateDetails }) => {
  const { transactions, settings } = useExpense();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper arrays for calendar days
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(month, year);
  const firstDayIndex = getFirstDayIndex(month, year);

  // Generate calendar grid array
  const calendarCells = [];
  
  // Fill empty spaces before first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }

  // Fill actual month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(year, month, day));
  }

  // Helper to filter transactions on a specific date
  const getTxnsForDate = (date) => {
    if (!date) return [];
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getDate() === date.getDate() &&
             tDate.getMonth() === date.getMonth() &&
             tDate.getFullYear() === date.getFullYear();
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-4">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-violet-500" />
          <h3 className="font-bold text-base tracking-tight text-slate-800 dark:text-slate-200">
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handlePrevMonth}
            className="p-2 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <FaChevronLeft size={10} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors text-slate-500"
          >
            Today
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* Weekdays Row header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-bold text-slate-400 mb-2">
        {weekdays.map(day => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Days Grid cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarCells.map((date, index) => {
          if (!date) {
            return (
              <div key={`empty-${index}`} className="aspect-square bg-slate-50/20 dark:bg-slate-900/10 rounded-xl opacity-30" />
            );
          }

          const txns = getTxnsForDate(date);
          const incomeSum = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
          const expenseSum = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={`day-${date.getDate()}`}
              className={`
                aspect-square p-1 md:p-2 border rounded-xl flex flex-col justify-between relative group transition-all duration-200 cursor-pointer
                ${isToday 
                  ? 'border-violet-500 bg-violet-50/10 dark:bg-violet-950/10' 
                  : 'border-slate-150 dark:border-slate-800/30 hover:border-violet-500/50 bg-slate-50/20 dark:bg-slate-800/10 hover:bg-white dark:hover:bg-slate-900'}
              `}
              onClick={() => onViewDateDetails && onViewDateDetails(date, txns)}
            >
              {/* Day Number & Quick Add FAB */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isToday ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-350'}`}>
                  {date.getDate()}
                </span>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAdd && onQuickAdd(date);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-violet-500 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-md transition-all"
                  title="Quick Add Transaction"
                >
                  <FaPlus size={8} />
                </button>
              </div>

              {/* Transactions Dot Indicator Indicators */}
              <div className="mt-1 space-y-0.5 max-h-12 overflow-hidden pointer-events-none">
                {/* Expense total indicator */}
                {expenseSum > 0 && (
                  <span className="block text-[8px] md:text-[9px] font-black text-rose-500 truncate leading-none">
                    -{formatCurrency(expenseSum, settings.currency).replace(/\.00$/, '')}
                  </span>
                )}
                {/* Income total indicator */}
                {incomeSum > 0 && (
                  <span className="block text-[8px] md:text-[9px] font-black text-emerald-550 dark:text-emerald-400 truncate leading-none">
                    +{formatCurrency(incomeSum, settings.currency).replace(/\.00$/, '')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default CalendarWidget;
