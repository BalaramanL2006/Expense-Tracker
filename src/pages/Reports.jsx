import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, exportToCSV, triggerPrint } from '../utils/helpers';
import { FaFileInvoice, FaFileExport, FaPrint, FaRegCalendarAlt, FaTable } from 'react-icons/fa';
import { APP_NAME } from '../utils/constants';
import { generatePDF } from '../services/pdfGenerator';

export const Reports = () => {
  const { transactions, settings, budgets, goals } = useExpense();
  const { user } = useAuth();

  // Date range state
  const [reportType, setReportType] = useState('monthly'); // daily, weekly, monthly, yearly, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Auto calculate range based on selection
  const getFilterDateRange = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (reportType === 'daily') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      // Start of current week (Sunday)
      const day = today.getDay();
      start.setDate(today.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (reportType === 'monthly') {
      // First and last days of month
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (reportType === 'yearly') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else { // custom
      start = startDate ? new Date(startDate) : new Date(0);
      end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    }

    return { start, end };
  };

  const { start: reportStart, end: reportEnd } = getFilterDateRange();

  // Filter items in range
  const reportTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= reportStart && tDate <= reportEnd;
  });

  // Calculate summaries
  const incomeItems = reportTransactions.filter(t => t.type === 'income');
  const expenseItems = reportTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeItems.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseItems.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const handlePrint = () => {
    generatePDF(user, reportTransactions, budgets, goals, `${reportType.toUpperCase()} STATEMENT`, startDate, endDate);
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reports</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and export your financial reports.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(reportTransactions, `financial_report_${reportType}.csv`)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200/50 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all text-slate-500"
            >
              <FaFileExport size={11} /> Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-black hover:scale-[1.01] hover:shadow transition-all"
            >
              <FaPrint size={11} /> Print Report
            </button>
          </div>
        </div>

        {/* Filter Selector Panel */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Report Type selector */}
            <div className="space-y-1">
              <label className="text-slate-400 font-bold">Statement Duration</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full md:w-48 px-3 py-2.5 glass-input"
              >
                <option value="daily">Daily Statement</option>
                <option value="weekly">Weekly Statement</option>
                <option value="monthly">Monthly Statement</option>
                <option value="yearly">Yearly Statement</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Date Pickers */}
            {reportType === 'custom' && (
              <>
                <div className="space-y-1">
                  <label className="text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 glass-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 glass-input"
                  />
                </div>
              </>
            )}

            <div className="text-[10px] text-slate-400 font-medium md:mb-3">
              <span>Duration: {formatDate(reportStart)} to {formatDate(reportEnd)}</span>
            </div>
          </div>
        </div>

        {/* Printable Sheet Frame */}
        <div id="print-area" className="glass-card p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40 bg-white dark:bg-slate-900 shadow-lg space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 text-white font-black text-lg">
                E
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-slate-850 dark:text-white">{APP_NAME} Statement</h3>
                <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">Expense Tracking Report</p>
              </div>
            </div>

            <div className="text-right">
              <h4 className="font-bold text-xs uppercase text-slate-400">Report Compiled</h4>
              <span className="font-black text-slate-600 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Financial Summaries */}
          <div className="grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 text-center">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Income</span>
              <p className="text-xl font-extrabold mt-1 text-emerald-555">+{formatCurrency(totalIncome, settings.currency)}</p>
              <span className="text-[10px] text-slate-405 mt-1 block">{incomeItems.length} transactions</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Expenditures</span>
              <p className="text-xl font-extrabold mt-1 text-rose-500">-{formatCurrency(totalExpense, settings.currency)}</p>
              <span className="text-[10px] text-slate-405 mt-1 block">{expenseItems.length} transactions</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Net Savings Statement</span>
              <p className={`text-xl font-extrabold mt-1 ${netSavings >= 0 ? 'text-emerald-555' : 'text-rose-500'}`}>
                {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings, settings.currency)}
              </p>
              <span className="text-[10px] text-slate-405 mt-1 block">{reportTransactions.length} records total</span>
            </div>
          </div>

          {/* Ledger table for printable view */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <FaTable size={12} />
              <h4 className="font-extrabold uppercase tracking-wider text-[10px]">Included Statement Transactions</h4>
            </div>
            
            <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-800/40">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="p-3">Date</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Method</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                  {reportTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                        No records match the selected statement date range.
                      </td>
                    </tr>
                  ) : (
                    reportTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/10">
                        <td className="p-3 text-slate-500 dark:text-slate-400">{formatDate(t.date)}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{t.title}</td>
                        <td className="p-3">{t.category}</td>
                        <td className="p-3">{t.paymentMethod}</td>
                        <td className={`p-3 text-right font-black ${t.type === 'income' ? 'text-emerald-555' : 'text-slate-850 dark:text-slate-200'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, settings.currency)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
};
export default Reports;
