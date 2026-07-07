import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { exportToCSV, parseCSV, triggerPrint } from '../utils/helpers';
import TransactionTable from '../components/TransactionTable';
import TransactionModal from '../components/TransactionModal';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { PAYMENT_METHODS } from '../utils/mockData';
import { generatePDF } from '../services/pdfGenerator';
import { 
  FaPlus, 
  FaFileExport, 
  FaFileImport, 
  FaPrint, 
  FaSearch, 
  FaFilter, 
  FaTimesCircle, 
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

export const Transactions = () => {
  const { 
    transactions, 
    addTransaction, 
    editTransaction, 
    deleteTransaction, 
    duplicateTransaction,
    importTransactions,
    budgets,
    goals
  } = useExpense();
  const { user } = useAuth();

  // Search/Filters toggle state
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dialog States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTxn, setDetailTxn] = useState(null);

  // Sync Search query from url parameters if present (e.g. from global search)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, []);

  // Unique categories list for filters select
  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

  // Filtering calculation logic
  const filteredTransactions = transactions.filter(t => {
    // 1. Search term (title, category, description, tags)
    const matchesSearch = searchTerm.trim() === '' || 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Income vs Expense
    const matchesType = filterType === 'all' || t.type === filterType;

    // 3. Category
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    // 4. Payment Method
    const matchesPayment = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;

    // 5. Amount Ranges
    const matchesMinAmount = minAmount === '' || t.amount >= parseFloat(minAmount);
    const matchesMaxAmount = maxAmount === '' || t.amount <= parseFloat(maxAmount);

    // 6. Dates
    const matchesStartDate = startDate === '' || new Date(t.date) >= new Date(startDate);
    const matchesEndDate = endDate === '' || new Date(t.date) <= new Date(endDate + 'T23:59:59');

    return matchesSearch && matchesType && matchesCategory && matchesPayment && 
           matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate;
  });

  // Actions
  const handleEditClick = (txn) => {
    setSelectedTxn(txn);
    setShowEditModal(true);
  };

  const handleViewDetails = (txn) => {
    setDetailTxn(txn);
    setShowDetailModal(true);
  };

  const handleSaveTransaction = (formattedData) => {
    if (selectedTxn) {
      editTransaction(selectedTxn.id, formattedData);
      setSelectedTxn(null);
    } else {
      addTransaction(formattedData);
    }
  };

  // CSV Import handler
  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          importTransactions(parsed);
        } else {
          alert('Could not parse any transaction items from the uploaded CSV file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterPaymentMethod('all');
    setMinAmount('');
    setMaxAmount('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your income and expense records.</p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* CSV Import */}
          <label className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer select-none text-slate-500">
            <FaFileImport size={11} /> Import CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleCSVImport} 
              className="hidden" 
            />
          </label>

          {/* CSV Export */}
          <button
            onClick={() => exportToCSV(filteredTransactions)}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all text-slate-500"
          >
            <FaFileExport size={11} /> Export CSV
          </button>

          {/* Export PDF */}
          <button
            onClick={() => generatePDF(
              user,
              filteredTransactions,
              budgets,
              goals,
              searchTerm ? `Search Results (Query: "${searchTerm}")` : 'TRANSACTION LEDGER',
              startDate,
              endDate
            )}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all text-slate-500"
          >
            <FaPrint size={11} /> Export PDF
          </button>

          {/* Add Action */}
          <button
            onClick={() => {
              setSelectedTxn(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:scale-[1.01] hover:shadow shadow-violet-500/10 transition-all ml-0.5"
          >
            <FaPlus size={10} /> Add Record
          </button>
        </div>
      </div>

      {/* Search Bar & Advanced Toggle Grid */}
      <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search input */}
          <div className="relative flex-1 flex items-center">
            <FaSearch className="absolute left-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ledger by title, tag, description note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 glass-input text-xs font-semibold"
            />
          </div>

          {/* Advanced toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-500 transition-colors text-xs"
          >
            <FaFilter size={11} /> Filters
            {showFilters ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
          </button>

          {/* Clear Filters helper */}
          {(searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterPaymentMethod !== 'all' || minAmount || maxAmount || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-red-500 transition-colors text-xs"
            >
              <FaTimesCircle size={12} /> Clear
            </button>
          )}
        </div>

        {/* Collapsed Filter Fields Selection panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs font-semibold animate-in slide-in-from-top-3 duration-200">
            {/* Filter Type */}
            <div className="space-y-1">
              <label className="text-slate-400">Transaction Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              >
                <option value="all">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-slate-400">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-slate-400">Payment Method</label>
              <select
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              >
                <option value="all">All Methods</option>
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div className="space-y-1">
              <label className="text-slate-400">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              />
            </div>

            {/* Date Range End */}
            <div className="space-y-1">
              <label className="text-slate-400">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              />
            </div>

            {/* Min Amount */}
            <div className="space-y-1">
              <label className="text-slate-400">Min Amount ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-1">
              <label className="text-slate-400">Max Amount ($)</label>
              <input
                type="number"
                placeholder="9999.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 glass-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Ledger Table */}
      <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEditClick}
          onDelete={deleteTransaction}
          onDuplicate={duplicateTransaction}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Form overlays */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveTransaction}
        transaction={null}
      />
      <TransactionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTxn(null);
        }}
        onSave={handleSaveTransaction}
        transaction={selectedTxn}
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
export default Transactions;
