import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';
import BudgetProgressCard from '../components/BudgetProgressCard';
import { FaPlus, FaTimes, FaWallet, FaExclamationTriangle } from 'react-icons/fa';

export const Budgets = () => {
  const { 
    budgets, 
    transactions, 
    addBudget, 
    editBudget, 
    deleteBudget, 
    categories,
    settings 
  } = useExpense();

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  
  // Form fields
  const [category, setCategory] = useState('All');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');

  // Compute spent amount for a budget category in current month
  const calculateSpent = (budgetCategory) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' &&
               (budgetCategory === 'All' || t.category === budgetCategory) &&
               d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(budget.amount);
    setPeriod(budget.period);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setCategory('All');
    setAmount('');
    setPeriod('monthly');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const budgetFields = {
      category,
      amount: numericAmount,
      period
    };

    if (editingBudget) {
      editBudget(editingBudget.id, budgetFields);
    } else {
      // Check if budget for this category already exists
      const exists = budgets.some(b => b.category === category && b.period === period);
      if (exists) {
        alert(`A ${period} budget for "${category}" already exists. Please edit that budget instead.`);
        return;
      }
      addBudget(budgetFields);
    }
    
    setShowModal(false);
  };

  // Computations for summary metrics
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + calculateSpent(b.category), 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const isGlobalOver = totalSpent > totalBudgeted;

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Budget</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your monthly spending limits.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/25 transition-all"
        >
          <FaPlus size={10} /> Create Budget
        </button>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider block">Total Monthly Budget Limit</span>
          <h3 className="text-2xl font-extrabold tracking-tight mt-1">{formatCurrency(totalBudgeted, settings.currency)}</h3>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider block">Total Spent this Month</span>
          <h3 className="text-2xl font-extrabold tracking-tight mt-1">{formatCurrency(totalSpent, settings.currency)}</h3>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider block">Remaining Capital</span>
          <h3 className={`text-2xl font-extrabold tracking-tight mt-1 ${isGlobalOver ? 'text-rose-500' : 'text-emerald-500'}`}>
            {isGlobalOver ? '-' : ''}{formatCurrency(Math.abs(totalRemaining), settings.currency)}
          </h3>
        </div>
      </div>

      {/* Over Budget Banner alert indicator */}
      {isGlobalOver && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl animate-pulse">
          <FaExclamationTriangle className="text-rose-500 flex-shrink-0" size={16} />
          <div>
            <h4 className="font-extrabold text-sm text-rose-900 dark:text-rose-300">Over-Budget Alarm Exceeded!</h4>
            <p className="text-[10px] text-rose-500 mt-0.5">Your monthly expenses exceed budgeted allowances by {formatCurrency(Math.abs(totalRemaining), settings.currency)}.</p>
          </div>
        </div>
      )}

      {/* Budgets Grid cards */}
      {budgets.length === 0 ? (
        <div className="glass-card p-12 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md text-center">
          <FaWallet size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No active budgets</h3>
          <p className="text-slate-450 text-[11px] mt-1 mb-4">Set category-specific spending limits to control your cash flow.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-all"
          >
            Create your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => (
            <BudgetProgressCard
              key={budget.id}
              budget={budget}
              spent={calculateSpent(budget.category)}
              onEdit={handleEditClick}
              onDelete={deleteBudget}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Budget Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          
          <div className="glass-modal w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-850 dark:text-white">
                {editingBudget ? 'Edit Budget Category' : 'Create Budget Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-650 dark:hover:text-white rounded-lg">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Select */}
              <div className="space-y-1">
                <label className="text-slate-400">Target Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input"
                  disabled={!!editingBudget} // lock category in edit mode
                >
                  <option value="All">All Categories (Global Budget)</option>
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount input */}
              <div className="space-y-1">
                <label className="text-slate-400">Budget Limit Amount *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input font-bold"
                  autoFocus
                />
              </div>

              {/* Period Select */}
              <div className="space-y-1">
                <label className="text-slate-400">Budget Limit Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-bold shadow-md shadow-violet-500/10"
                >
                  {editingBudget ? 'Save Changes' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Budgets;
