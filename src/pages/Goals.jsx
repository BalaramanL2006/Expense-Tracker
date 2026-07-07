import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/helpers';
import GoalCard from '../components/GoalCard';
import { FaPlus, FaTimes, FaBullseye } from 'react-icons/fa';

export const Goals = () => {
  const { goals, addGoal, editGoal, deleteGoal, settings } = useExpense();

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount);
    setCurrentAmount(goal.currentAmount);
    setDeadline(goal.deadline);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setShowModal(true);
  };

  const handleAddFunds = (id, amount) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      editGoal(id, { currentAmount: goal.currentAmount + amount });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericTarget = parseFloat(targetAmount);
    const numericCurrent = parseFloat(currentAmount) || 0;

    if (isNaN(numericTarget) || numericTarget <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }

    const goalFields = {
      title,
      targetAmount: numericTarget,
      currentAmount: numericCurrent,
      deadline
    };

    if (editingGoal) {
      editGoal(editingGoal.id, goalFields);
    } else {
      addGoal(goalFields);
    }

    setShowModal(false);
  };

  // Computations
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completionRate = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track and manage your savings goals.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/25 transition-all"
        >
          <FaPlus size={10} /> Create Goal
        </button>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider block">Total Milestone Savings Target</span>
          <h3 className="text-2xl font-extrabold tracking-tight mt-1">{formatCurrency(totalTarget, settings.currency)}</h3>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider block">Total Capital Accumulated</span>
          <h3 className="text-2xl font-extrabold tracking-tight mt-1 text-emerald-555">{formatCurrency(totalSaved, settings.currency)}</h3>
        </div>

        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-450 text-[10px] uppercase font-bold tracking-wider block">Aggregate Progress rate</span>
          <h3 className="text-2xl font-extrabold tracking-tight mt-1 text-violet-555">{completionRate}% Completed</h3>
        </div>
      </div>

      {/* Savings Grid list */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md text-center">
          <FaBullseye size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No active goals</h3>
          <p className="text-slate-450 text-[11px] mt-1 mb-4">Set saving milestones to build your emergency vault or plan trips.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl transition-all"
          >
            Create your first savings goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditClick}
              onDelete={deleteGoal}
              onAddFunds={handleAddFunds}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          
          <div className="glass-modal w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-850 dark:text-white">
                {editingGoal ? 'Edit Savings Target' : 'Create Savings Target'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-655 dark:hover:text-white rounded-lg">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title input */}
              <div className="space-y-1">
                <label className="text-slate-400">Savings Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Macbook Pro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input"
                  autoFocus
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-1">
                <label className="text-slate-400">Target Amount *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input font-bold"
                />
              </div>

              {/* Current Amount */}
              <div className="space-y-1">
                <label className="text-slate-400">Starting Savings Balance</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input font-bold"
                  disabled={!!editingGoal} // lock starting capital in edit mode
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1">
                <label className="text-slate-400">Target Completion Date *</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 glass-input"
                />
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
                  {editingGoal ? 'Save Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Goals;
