import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { FaTimes, FaCalendarAlt, FaWallet, FaCheckCircle, FaTag, FaClipboard } from 'react-icons/fa';

export const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
  const { settings } = useExpense();

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

      {/* Details Dialog Frame */}
      <div className="glass-modal w-full max-w-md p-6 relative overflow-y-auto max-h-[85vh] no-scrollbar z-10 animate-in zoom-in-95 duration-200">
        {/* Header Close triggers */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-5">
          <h3 className="text-base font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Transaction Information
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Transaction Summary Panel */}
        <div className="text-center space-y-2 mb-6">
          <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-bold border ${transaction.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
            {transaction.type === 'income' ? 'INCOME' : 'EXPENSE'}
          </span>
          <h2 className="text-3xl font-black tracking-tight mt-1">
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, settings.currency)}
          </h2>
          <p className="font-extrabold text-slate-700 dark:text-slate-200 text-sm">{transaction.title}</p>
        </div>

        {/* Grid Meta Info Details */}
        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Date & Time</span>
              <span className="flex items-center gap-1.5 font-bold">
                <FaCalendarAlt className="text-slate-400" />
                {formatDate(transaction.date, 'full')}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Payment Method</span>
              <span className="flex items-center gap-1.5 font-bold">
                <FaWallet className="text-slate-400" />
                {transaction.paymentMethod}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Category</span>
              <span className="inline-block px-2.5 py-0.5 border rounded-full text-[10px] font-extrabold bg-slate-50 border-slate-200 text-slate-650 dark:bg-slate-800 dark:border-slate-700 mt-1">
                {transaction.category}
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
              <span className="flex items-center gap-1.5 text-emerald-500 font-bold mt-1">
                <FaCheckCircle size={12} />
                {transaction.status || 'Completed'}
              </span>
            </div>
          </div>

          {/* Tags list */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {transaction.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/20 text-[10px] text-violet-600 font-bold border border-violet-200/50">
                    <FaTag size={8} /> {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes description */}
          {transaction.description && (
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Description Notes</span>
              <p className="text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-800/20 p-2.5 rounded-xl border border-slate-200/30 font-medium leading-normal">
                {transaction.description}
              </p>
            </div>
          )}

          {/* Receipt display */}
          {transaction.receiptImage && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">Receipt Attachment</span>
              <div className="border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src={transaction.receiptImage}
                  alt="Receipt Preview"
                  className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                  onClick={() => window.open(transaction.receiptImage, '_blank')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end pt-5 border-t border-slate-100 dark:border-slate-800/60 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
export default TransactionDetailModal;
