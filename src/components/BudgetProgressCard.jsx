import React from 'react';
import { motion } from 'framer-motion';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';
import { FaTrash, FaPen, FaExclamationTriangle } from 'react-icons/fa';

export const BudgetProgressCard = ({ budget, spent, onEdit, onDelete }) => {
  const { settings } = useExpense();
  
  const percent = Math.min(100, Math.round((spent / budget.amount) * 100)) || 0;
  const isOver = spent > budget.amount;
  const isWarning = !isOver && percent >= 85;

  // Determine progress bar color
  const getBarColor = () => {
    if (isOver) return 'bg-rose-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getCardBorder = () => {
    if (isOver) return 'border-rose-500/30 dark:border-rose-500/20';
    if (isWarning) return 'border-amber-500/30 dark:border-amber-500/20';
    return 'border-slate-200/50 dark:border-slate-800/40';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-5 border ${getCardBorder()} relative flex flex-col justify-between space-y-4`}
    >
      {/* Title & Category Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-base tracking-tight">{budget.category} Budget</h4>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {budget.period} limit
          </span>
        </div>
        
        {/* Quick Edit/Delete buttons */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            {onEdit && (
              <button 
                onClick={() => onEdit(budget)}
                className="p-1.5 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Edit Budget"
              >
                <FaPen size={11} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(budget.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Delete Budget"
              >
                <FaTrash size={11} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Numerical Stats */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black tracking-tight">
            {formatCurrency(spent, settings.currency)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            of {formatCurrency(budget.amount, settings.currency)}
          </span>
        </div>

        {/* Warning Badge */}
        {isOver ? (
          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500">
            <FaExclamationTriangle size={10} /> Over budget by {formatCurrency(spent - budget.amount, settings.currency)}!
          </div>
        ) : isWarning ? (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
            <FaExclamationTriangle size={10} /> Warning: Approaching limit!
          </div>
        ) : (
          <div className="text-[11px] font-semibold text-emerald-500">
            Remaining: {formatCurrency(budget.amount - spent, settings.currency)}
          </div>
        )}
      </div>

      {/* Progress slider bar container */}
      <div className="space-y-1">
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${getBarColor()}`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
          <span>{percent}% consumed</span>
          <span>100% Limit</span>
        </div>
      </div>
    </motion.div>
  );
};
export default BudgetProgressCard;
