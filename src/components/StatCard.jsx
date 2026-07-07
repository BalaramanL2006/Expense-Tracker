import React from 'react';
import { motion } from 'framer-motion';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';

export const StatCard = ({ title, value, type, trend, icon: Icon, gradient }) => {
  const { settings } = useExpense();

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, scale: 1.01 }}
      className={`glass-card p-6 overflow-hidden relative flex flex-col justify-between h-40 border border-slate-200/50 dark:border-slate-800/40`}
    >
      {/* Decorative gradient blur circle in card background */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-tr ${gradient} opacity-20 dark:opacity-25 blur-xl`} />

      {/* Header Info */}
      <div className="flex items-center justify-between z-10">
        <span className="text-sm font-semibold tracking-wide text-slate-400 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-3 rounded-xl bg-gradient-to-tr ${gradient} text-white shadow-md shadow-violet-500/10`}>
          <Icon className="text-base" />
        </div>
      </div>

      {/* Main Stats Value */}
      <div className="mt-4 z-10">
        <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {formatCurrency(value, settings.currency)}
        </h3>
      </div>

      {/* Trend Percentage Details */}
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs z-10">
          <span className={`font-bold ${trend.startsWith('+') ? 'text-emerald-550 dark:text-emerald-400' : 'text-rose-550 dark:text-rose-450'}`}>
            {trend}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};
export default StatCard;
