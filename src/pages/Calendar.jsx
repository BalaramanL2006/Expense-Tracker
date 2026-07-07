import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import CalendarWidget from '../components/CalendarWidget';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { FaPlus, FaCalendarCheck, FaInfoCircle } from 'react-icons/fa';

export const Calendar = () => {
  const { addTransaction, editTransaction, settings } = useExpense();
  
  // Selected day details states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTxns, setSelectedTxns] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultAddDate, setDefaultAddDate] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTxn, setDetailTxn] = useState(null);

  const handleQuickAddClick = (date) => {
    setDefaultAddDate(date);
    setShowAddModal(true);
  };

  const handleDateClick = (date, dayTxns) => {
    setSelectedDate(date);
    setSelectedTxns(dayTxns);
  };

  const handleSaveTransaction = (data) => {
    addTransaction(data);
    // Refresh currently inspected lists
    setSelectedTxns(prev => [...prev, data]);
  };

  const handleViewDetails = (txn) => {
    setDetailTxn(txn);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View your transactions in a monthly calendar layout.</p>
        </div>

        <button
          onClick={() => handleQuickAddClick(new Date())}
          className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:scale-[1.01] hover:shadow transition-all"
        >
          <FaPlus size={10} /> Quick Add
        </button>
      </div>

      {/* Grid: Calendar widget (Left) and Daily Ledger inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Reusable Calendar Grid (2/3 width) */}
        <div className="lg:col-span-2">
          <CalendarWidget
            onQuickAdd={handleQuickAddClick}
            onViewDateDetails={handleDateClick}
          />
        </div>

        {/* Right: Daily Ledger inspector (1/3 width) */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <FaCalendarCheck className="text-violet-500" size={14} />
              <h3 className="font-bold text-sm text-slate-850 dark:text-white uppercase tracking-tight">
                Details for {formatDate(selectedDate)}
              </h3>
            </div>

            {/* List items */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto no-scrollbar">
              {selectedTxns.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FaInfoCircle size={24} className="mx-auto text-slate-350 dark:text-slate-800 mb-2" />
                  <p className="text-[11px] font-semibold">No records on this date.</p>
                  <button 
                    onClick={() => handleQuickAddClick(selectedDate)}
                    className="text-[10px] text-violet-500 hover:underline font-bold mt-1"
                  >
                    + Add one now
                  </button>
                </div>
              ) : (
                selectedTxns.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => handleViewDetails(t)}
                    className="p-3 border border-slate-200/20 dark:border-slate-800/50 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/30 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold truncate text-slate-850 dark:text-white">{t.title}</p>
                      <span className="inline-block text-[9px] font-bold text-slate-400 mt-0.5">{t.category}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black ${t.type === 'income' ? 'text-emerald-555' : 'text-slate-800 dark:text-slate-250'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                      </p>
                      <span className="text-[9px] font-bold text-slate-405">{t.paymentMethod}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>Daily Count: {selectedTxns.length} records</span>
            <span>Spent: {formatCurrency(selectedTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Modal Quick Add Dialog */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveTransaction}
        transaction={null}
      />
      <TransactionDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setDetailTxn(null);
        }}
        transaction={detailTxn}
      />
    </div>
  );
};
export default Calendar;
