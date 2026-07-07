import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { formatCurrency, calculateFinancialScore } from '../utils/helpers';
import { WeeklySpendingChart, MonthlyExpenseChart } from '../components/Charts';
import { FaHeartbeat, FaArrowUp, FaArrowDown, FaChartBar, FaPercent, FaRegLightbulb } from 'react-icons/fa';
import { APP_NAME } from '../utils/constants';

export const Analytics = () => {
  const { transactions, goals, settings } = useExpense();

  // --- ANALYTICS COMPUTATIONS ---
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // 1. Savings Rate Calculation
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  // 2. Average Spending Calculation
  const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;

  // 3. Highest Expense Category
  const categoryExpenses = {};
  expenses.forEach(t => {
    categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
  });
  
  let highestExpenseCat = 'None';
  let highestExpenseAmt = 0;
  Object.keys(categoryExpenses).forEach(cat => {
    if (categoryExpenses[cat] > highestExpenseAmt) {
      highestExpenseAmt = categoryExpenses[cat];
      highestExpenseCat = cat;
    }
  });

  // 4. Top Income Source
  const incomeSources = {};
  incomes.forEach(t => {
    incomeSources[t.category] = (incomeSources[t.category] || 0) + t.amount;
  });
  
  let topIncomeSource = 'None';
  let topIncomeAmt = 0;
  Object.keys(incomeSources).forEach(source => {
    if (incomeSources[source] > topIncomeAmt) {
      topIncomeAmt = incomeSources[source];
      topIncomeSource = source;
    }
  });

  // 5. Goal completion progress calculation
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalProgressFraction = totalGoalTarget > 0 ? (totalGoalSaved / totalGoalTarget) : 0;

  // 6. Financial Score (0 - 100)
  const financialScore = calculateFinancialScore(totalIncome, totalExpense, goalProgressFraction);

  // Get score description & color
  const getScoreDetails = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-500 border-emerald-300 dark:border-emerald-900 bg-emerald-50/20' };
    if (score >= 60) return { label: 'Good', color: 'text-violet-500 border-violet-300 dark:border-violet-900 bg-violet-50/20' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-500 border-amber-300 dark:border-amber-900 bg-amber-50/20' };
    return { label: 'Critical', color: 'text-rose-500 border-rose-300 dark:border-rose-900 bg-rose-50/20' };
  };

  const scoreDetails = getScoreDetails(financialScore);

  // --- RECHARTS FORMATTING ---

  // 1. Weekly Spending breakdown (Mon - Sun)
  const getWeeklyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailySpend = days.map(d => ({ name: d, Amount: 0 }));

    // Filter transactions in past 7 days
    const pastWeek = new Date();
    pastWeek.setDate(pastWeek.getDate() - 7);

    transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= pastWeek)
      .forEach(t => {
        const dayIdx = new Date(t.date).getDay();
        dailySpend[dayIdx].Amount += t.amount;
      });

    return dailySpend;
  };

  // 2. Monthly expenditure timeline (last 6 months)
  const getMonthlyTimelineData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = months[d.getMonth()];
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyData[key] = { name: mLabel, Amount: 0, sortKey: d.getTime() };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyData[key] && t.type === 'expense') {
        monthlyData[key].Amount += t.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey);
  };

  // Recommendations generator
  const getFinancialInsight = (score) => {
    if (score >= 80) return 'Your financial score is excellent! Maintain your current budget thresholds and prioritize high-yield investments for saved capital.';
    if (score >= 60) return 'Solid financial habits! Consider building a higher savings buffer and checking recurring bills to lower discretionary expenses.';
    if (score >= 40) return 'Your expenses consume a significant portion of income. Review your highest category spends and try establishing custom weekly budgets.';
    return 'Your financial standing is critical. Discretionary expenses exceed limits. Prioritize essential savings goals, minimize card transactions, and draft strict budgets.';
  };

  return (
    <div className="space-y-6 text-xs font-semibold">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and analyze your financial trends.</p>
      </div>

      {/* Financial Health Score & Insight banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score widget */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <FaHeartbeat className="text-violet-500 animate-pulse" />
            <span>Financial Health Score</span>
          </div>
          
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer circular layout simulation */}
            <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
              <span className="text-3xl font-black tracking-tighter">{financialScore}</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full border font-extrabold ${scoreDetails.color}`}>
            {scoreDetails.label} Rating
          </span>
        </div>

        {/* Insight Box */}
        <div className="lg:col-span-2 glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center gap-2 text-violet-555">
            <FaRegLightbulb size={14} />
            <h4 className="font-extrabold text-sm uppercase tracking-tight">{APP_NAME} Financial Advice</h4>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed my-3">
            {getFinancialInsight(financialScore)}
          </p>

          <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 text-[10px] text-slate-400">
            <span>Score Calculated: {new Date().toLocaleDateString()}</span>
            <span>Based on 150 Transactions</span>
          </div>
        </div>
      </div>

      {/* Grid: Financial statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Highest Expense */}
        <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Top Expense Category</span>
          <h4 className="text-base font-bold text-slate-850 dark:text-white mt-1">{highestExpenseCat}</h4>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Total: {formatCurrency(highestExpenseAmt, settings.currency)}</span>
        </div>

        {/* Top Income */}
        <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Top Income Source</span>
          <h4 className="text-base font-bold text-slate-850 dark:text-white mt-1">{topIncomeSource}</h4>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Total: {formatCurrency(topIncomeAmt, settings.currency)}</span>
        </div>

        {/* Average Spend */}
        <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Average Spend / Txn</span>
          <h4 className="text-base font-black text-slate-850 dark:text-white mt-1">{formatCurrency(avgExpense, settings.currency)}</h4>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Count: {expenses.length} expenses</span>
        </div>

        {/* Net Flow */}
        <div className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Net Cash Flow</span>
          <h4 className={`text-base font-black mt-1 ${netCashFlow >= 0 ? 'text-emerald-555' : 'text-rose-500'}`}>
            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow, settings.currency)}
          </h4>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Ratio: {savingsRate}% Savings Rate</span>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight uppercase">
              Weekly Spending Trends (Past 7 Days)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Days of the Week</span>
          </div>
          <WeeklySpendingChart data={getWeeklyChartData()} />
        </div>

        {/* Monthly Expense Trends */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight uppercase">
              Monthly Expense Timelines (Last 6 Months)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Total Spent</span>
          </div>
          <MonthlyExpenseChart data={getMonthlyTimelineData()} />
        </div>
      </div>
    </div>
  );
};
export default Analytics;
