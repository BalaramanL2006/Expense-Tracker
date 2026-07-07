import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { 
  FaTrash, 
  FaPen, 
  FaCopy, 
  FaEye, 
  FaChevronLeft, 
  FaChevronRight, 
  FaArrowUp, 
  FaArrowDown, 
  FaChevronDown,
  FaFileInvoiceDollar
} from 'react-icons/fa';

export const TransactionTable = ({ 
  transactions, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onViewDetails,
  readOnly = false
}) => {
  const { settings, bulkDeleteTransactions } = useExpense();
  
  // States
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;

  // Sorting handlers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort logic
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aField = a[sortField];
    let bField = b[sortField];
    
    if (sortField === 'date') {
      aField = new Date(a.date).getTime();
      bField = new Date(b.date).getTime();
    }
    
    if (aField < bField) return sortDirection === 'asc' ? -1 : 1;
    if (aField > bField) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Bulk actions handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    if (e.target.checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
      bulkDeleteTransactions(selectedIds);
      setSelectedIds([]);
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FaArrowUp className="inline ml-1" size={10} /> : <FaArrowDown className="inline ml-1" size={10} />;
  };

  // Helper for category badge styling
  const getCategoryColor = (categoryName) => {
    const colors = {
      'Food': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30',
      'Travel': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30',
      'Shopping': 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-900/30',
      'Bills': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30',
      'Education': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-900/30',
      'Health': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30',
      'Entertainment': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30',
      'Investment': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-300 dark:border-indigo-900/30',
      'Salary': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/45 dark:text-emerald-400 dark:border-emerald-900/50',
      'Business': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/45 dark:text-teal-400 dark:border-teal-900/50',
      'Freelancing': 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/45 dark:text-cyan-400 dark:border-cyan-900/50',
    };

    return colors[categoryName] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-350 dark:border-slate-700/50';
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions and info */}
      {!readOnly && selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl animate-in slide-in-from-top-2 duration-200">
          <span className="text-xs font-bold text-red-800 dark:text-red-250">
            {selectedIds.length} items selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-750 text-white font-bold transition-all shadow-md shadow-red-500/10"
          >
            <FaTrash size={10} /> Delete Selected
          </button>
        </div>
      )}

      {/* Main Table wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50">
              {!readOnly && (
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length}
                    className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                </th>
              )}
              <th className="p-4 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => handleSort('date')}>
                Date {getSortIcon('date')}
              </th>
              <th className="p-4 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => handleSort('title')}>
                Title {getSortIcon('title')}
              </th>
              <th className="p-4 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => handleSort('category')}>
                Category {getSortIcon('category')}
              </th>
              <th className="p-4 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => handleSort('paymentMethod')}>
                Method {getSortIcon('paymentMethod')}
              </th>
              <th className="p-4 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors text-right" onClick={() => handleSort('amount')}>
                Amount {getSortIcon('amount')}
              </th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800/30 text-sm">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 7 : 8} className="p-8 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaFileInvoiceDollar size={32} className="text-slate-300 dark:text-slate-700" />
                    <span>No transactions match your search filter settings</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t) => (
                <tr 
                  key={t.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${selectedIds.includes(t.id) ? 'bg-violet-50/20 dark:bg-violet-950/5' : ''}`}
                >
                  {/* Select One checkmark */}
                  {!readOnly && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onChange={(e) => handleSelectOne(e, t.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500"
                      />
                    </td>
                  )}

                  {/* Date Column */}
                  <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-semibold">
                    {formatDate(t.date, 'short')} <span className="text-[10px] text-slate-350 block mt-0.5">{formatDate(t.date, 'time')}</span>
                  </td>

                  {/* Title Column */}
                  <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                    <span className="block truncate max-w-xs">{t.title}</span>
                    {t.recurring && (
                      <span className="inline-block text-[8px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 rounded px-1 mt-0.5 font-bold uppercase tracking-wider">
                        Recurring
                      </span>
                    )}
                  </td>

                  {/* Category Column */}
                  <td className="p-4 whitespace-nowrap">
                    <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-bold ${getCategoryColor(t.category)}`}>
                      {t.category}
                    </span>
                  </td>

                  {/* Payment Method Column */}
                  <td className="p-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    {t.paymentMethod}
                  </td>

                  {/* Amount Column */}
                  <td className={`p-4 text-right font-extrabold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-550 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-250'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                  </td>

                  {/* Status Column */}
                  <td className="p-4 text-center whitespace-nowrap">
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50">
                      {t.status || 'Completed'}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewDetails(t)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                        title="View Details"
                      >
                        <FaEye size={12} />
                      </button>
                      {!readOnly && onEdit && (
                        <button
                          onClick={() => onEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit Transaction"
                        >
                          <FaPen size={11} />
                        </button>
                      )}
                      {!readOnly && onDuplicate && (
                        <button
                          onClick={() => onDuplicate(t.id)}
                          className="p-1.5 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Duplicate"
                        >
                          <FaCopy size={11} />
                        </button>
                      )}
                      {!readOnly && onDelete && (
                        <button
                          onClick={() => onDelete(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 font-semibold">
            Page {currentPage} of {totalPages} ({transactions.length} total entries)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-500"
            >
              <FaChevronLeft size={10} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${currentPage === i + 1 ? 'bg-violet-600 hover:bg-violet-750 text-white shadow-md shadow-violet-500/15' : 'border border-slate-200/50 dark:border-slate-800/80 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200/50 dark:border-slate-800/80 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-500"
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TransactionTable;
