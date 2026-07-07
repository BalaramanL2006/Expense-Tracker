import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { FaTrash, FaPen, FaPlus, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import confetti from 'canvas-confetti';

export const GoalCard = ({ goal, onEdit, onDelete, onAddFunds }) => {
  const { settings } = useExpense();
  const [fundingAmount, setFundingAmount] = useState('');
  const [showFundInput, setShowFundInput] = useState(false);

  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  // Calculate days remaining
  const getDaysRemaining = () => {
    const today = new Date();
    const target = new Date(goal.deadline);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    return `${diffDays} days left`;
  };

  const handleFundSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(fundingAmount);
    if (!isNaN(val) && val > 0) {
      // If adding funds completes the goal, trigger confetti!
      const nextAmt = goal.currentAmount + val;
      if (nextAmt >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
      onAddFunds(goal.id, val);
      setFundingAmount('');
      setShowFundInput(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 border ${isCompleted ? 'border-emerald-500/30 dark:border-emerald-500/20' : 'border-slate-200/50 dark:border-slate-800/40'} relative flex flex-col justify-between space-y-4`}
    >
      {/* Complete Overlays & Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-base tracking-tight truncate">{goal.title}</h4>
            {isCompleted && (
              <FaCheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold mt-0.5">
            <FaCalendarAlt size={10} />
            <span>Target: {formatDate(goal.deadline)}</span>
            <span className="mx-1">•</span>
            <span className={getDaysRemaining() === 'Overdue' ? 'text-rose-500' : 'text-slate-400'}>
              {getDaysRemaining()}
            </span>
          </div>
        </div>

        {/* Quick Edit/Delete controls */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button 
                onClick={() => onEdit(goal)}
                className="p-1.5 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Edit Goal"
              >
                <FaPen size={11} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(goal.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Delete Goal"
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
            {formatCurrency(goal.currentAmount, settings.currency)}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            saved of {formatCurrency(goal.targetAmount, settings.currency)}
          </span>
        </div>
      </div>

      {/* Progress Bars & Add Funds Actions */}
      <div className="space-y-3">
        {/* Progress bar Slider */}
        <div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-violet-500'}`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-1">
            <span>{percent}% completed</span>
            <span>Target reached</span>
          </div>
        </div>

        {/* Funds quick action form toggling */}
        {!isCompleted && onAddFunds && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {showFundInput ? (
              <form onSubmit={handleFundSubmit} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Amount"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs glass-input"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs bg-violet-600 hover:bg-violet-750 text-white font-bold transition-all shadow-md shadow-violet-500/10"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowFundInput(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowFundInput(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 font-bold transition-all"
              >
                <FaPlus size={10} /> Add Savings Funds
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default GoalCard;
