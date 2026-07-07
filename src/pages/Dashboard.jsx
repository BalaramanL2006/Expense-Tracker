import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import BudgetProgressCard from '../components/BudgetProgressCard';
import GoalCard from '../components/GoalCard';
import { 
  IncomeExpenseChart, 
  CategoryPieChart, 
  WeeklySpendingChart, 
  MonthlyExpenseChart 
} from '../components/Charts';
import TransactionTable from '../components/TransactionTable';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaWallet, 
  FaPiggyBank,
  FaFileInvoiceDollar,
  FaArrowRight,
  FaRegLightbulb
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { formatCurrency, calculateFinancialScore } from '../utils/helpers';

export const Dashboard = () => {
  const { 
    transactions, 
    budgets,
    goals,
    settings
  } = useExpense();
  const { user } = useAuth();
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTxn, setDetailTxn] = useState(null);

  // --- STATS COMPUTATIONS ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Total Cumulative Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  
  // 2. Current Month calculations
  const curMonthIncome = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const curMonthExpense = transactions
    .filter(t => {
      const d = new Date(t.date);
      return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate percentage trends (mock comparison for UI depth)
  const incomeTrend = curMonthIncome > 0 ? `+${((curMonthIncome / (totalIncome || 1)) * 100).toFixed(1)}%` : '+0.0%';
  const expenseTrend = curMonthExpense > 0 ? `+${((curMonthExpense / (totalExpense || 1)) * 100).toFixed(1)}%` : '+0.0%';

  // --- RECHARTS FORMATTING ---
  
  // 1. Income vs Expense recent months data mapping (last 6 months)
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySummary = {};

    // Get last 6 months list
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlySummary[key] = { name: mLabel, Income: 0, Expense: 0, sortKey: d.getTime() };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlySummary[key]) {
        if (t.type === 'income') monthlySummary[key].Income += t.amount;
        if (t.type === 'expense') monthlySummary[key].Expense += t.amount;
      }
    });

    return Object.values(monthlySummary).sort((a, b) => a.sortKey - b.sortKey);
  };

  // 2. Category chart breakdown (expenses only)
  const getCategoryChartData = () => {
    const categoryTotals = {};
    const expenseTxns = transactions.filter(t => t.type === 'expense');

    expenseTxns.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryColors = {
      'Food': '#EF4444',
      'Travel': '#3B82F6',
      'Shopping': '#EC4899',
      'Bills': '#F59E0B',
      'Education': '#8B5CF6',
      'Health': '#10B981',
      'Entertainment': '#F43F5E',
      'Investment': '#6366F1',
      'Others': '#6B7280'
    };

    return Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat],
      color: categoryColors[cat] || '#8B5CF6'
    })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5
  };

  // 3. Weekly Spending breakdown (Mon - Sun)
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

  // 4. Monthly expenditure timeline (last 6 months)
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

  // 5. Budget Spent helper
  const calculateSpent = (budgetCategory) => {
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

  // 6. Financial Health Score calculation
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const goalProgressFraction = totalGoalTarget > 0 ? (totalGoalSaved / totalGoalTarget) : 0;
  const financialScore = calculateFinancialScore(totalIncome, totalExpense, goalProgressFraction);

  const getScoreDetails = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-500 border-emerald-350 dark:border-emerald-900 bg-emerald-550/10' };
    if (score >= 60) return { label: 'Good', color: 'text-violet-500 border-violet-300 dark:border-violet-900 bg-violet-500/10' };
    if (score >= 40) return { label: 'Fair', color: 'text-amber-500 border-amber-300 dark:border-amber-900 bg-amber-500/10' };
    return { label: 'Critical', color: 'text-rose-500 border-rose-300 dark:border-rose-900 bg-rose-500/10' };
  };

  const scoreDetails = getScoreDetails(financialScore);

  const getFinancialInsight = (score) => {
    if (score >= 80) return 'Your financial score is excellent! Maintain your current budget thresholds and prioritize high-yield investments for saved capital.';
    if (score >= 60) return 'Solid financial habits! Consider building a higher savings buffer and checking recurring bills to lower discretionary expenses.';
    if (score >= 40) return 'Your expenses consume a significant portion of income. Review your highest category spends and try establishing custom weekly budgets.';
    return 'Your financial standing is critical. Discretionary expenses exceed limits. Prioritize essential savings goals, minimize card transactions, and draft strict budgets.';
  };

  // 7. Upcoming bills helper
  const getUpcomingBills = () => {
    const seen = new Set();
    return transactions
      .filter(t => t.type === 'expense' && t.recurring)
      .filter(t => {
        if (seen.has(t.title)) return false;
        seen.add(t.title);
        return true;
      })
      .slice(0, 3);
  };

  const handleViewDetails = (txn) => {
    setDetailTxn(txn);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, {user?.name || 'Bala'} 👋</p>
        </div>
      </div>

      {/* Grid: Stat Summary Cards (Total Balance, Total Income, Total Expense, Total Savings) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={totalBalance}
          type="balance"
          trend={totalBalance >= 0 ? `+${savingsRate}% saved` : `-${Math.abs(savingsRate)}% deficit`}
          icon={FaWallet}
          gradient="from-violet-650 to-indigo-500"
        />
        <StatCard
          title="Total Income"
          value={totalIncome}
          type="income"
          trend="All-time earnings"
          icon={FaArrowUp}
          gradient="from-emerald-400 to-teal-500"
        />
        <StatCard
          title="Total Expense"
          value={totalExpense}
          type="expense"
          trend="All-time spending"
          icon={FaArrowDown}
          gradient="from-rose-400 to-red-500"
        />
        <StatCard
          title="Total Savings"
          value={totalBalance > 0 ? totalBalance : 0}
          type="savings"
          trend={`${savingsRate}% Rate`}
          icon={FaPiggyBank}
          gradient="from-indigo-400 to-purple-500"
        />
      </div>

      {/* Grid: Main Recharts Charts (Income vs Expense & Category Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense (2/3 width) */}
        <div className="lg:col-span-2 glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
            Income vs Expenditure Trends
          </h3>
          <IncomeExpenseChart data={getMonthlyChartData()} />
        </div>

        {/* Categories Pie breakdown (1/3 width) */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 tracking-tight uppercase">
            Expense Category Breakdown
          </h3>
          {getCategoryChartData().length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <FaFileInvoiceDollar size={32} className="text-slate-350 dark:text-slate-800 mb-2" />
              <p className="text-xs font-semibold">No expenditure records yet.</p>
            </div>
          ) : (
            <CategoryPieChart data={getCategoryChartData()} />
          )}
        </div>
      </div>

      {/* Grid: Secondary Analytics (Weekly chart, Monthly Trend line, Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Spending */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
            Weekly Spending
          </h3>
          <WeeklySpendingChart data={getWeeklyChartData()} />
        </div>

        {/* Monthly Expense Chart */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
            Monthly Expenditure Trend
          </h3>
          <MonthlyExpenseChart data={getMonthlyTimelineData()} />
        </div>

        {/* Financial Insights Card */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
              Financial Insights
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full border-4 border-slate-150 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/30">
                <span className="text-lg font-black tracking-tighter">{financialScore}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Health Score</span>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreDetails.color}`}>
                  {scoreDetails.label}
                </span>
              </div>
            </div>
            <div className="p-3.5 bg-violet-500/5 border border-violet-500/10 rounded-xl flex items-start gap-2.5">
              <FaRegLightbulb className="text-violet-500 flex-shrink-0 mt-0.5" size={14} />
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                {getFinancialInsight(financialScore)}
              </p>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold tracking-wide mt-4 border-t border-slate-100 dark:border-slate-850 pt-2 text-center">
            Score computed from savings rate and goal completion.
          </div>
        </div>
      </div>

      {/* Grid: Progress Listings & Bills (Budget Progress, Goals Progress, Bills) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
            Budget Progress
          </h3>
          <div className="space-y-4 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
            {budgets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                <p className="text-xs">No active budgets scheduled.</p>
              </div>
            ) : (
              budgets.slice(0, 3).map(b => (
                <BudgetProgressCard
                  key={b.id}
                  budget={b}
                  spent={calculateSpent(b.category)}
                  onEdit={null}
                  onDelete={null}
                />
              ))
            )}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
            Goals Progress
          </h3>
          <div className="space-y-4 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
            {goals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium">
                <p className="text-xs">No active savings targets.</p>
              </div>
            ) : (
              goals.slice(0, 3).map(g => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={null}
                  onDelete={null}
                  onAddFunds={null}
                />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 tracking-tight uppercase">
            Upcoming Bills
          </h3>
          <div className="space-y-4 max-h-[340px] overflow-y-auto no-scrollbar pr-0.5">
            {getUpcomingBills().length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FaFileInvoiceDollar size={32} className="text-slate-350 dark:text-slate-800 mb-2" />
                <p className="text-xs font-semibold">No recurring bills scheduled.</p>
              </div>
            ) : (
              getUpcomingBills().map(bill => {
                return (
                  <div key={bill.id} className="glass-card p-4 border border-slate-200/50 dark:border-slate-800/45 bg-white/40 dark:bg-slate-900/40 shadow-sm backdrop-blur-xs flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{bill.title}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{bill.category} • Monthly</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-rose-500">-{formatCurrency(bill.amount, settings.currency)}</span>
                      <p className="text-[8px] text-slate-450 font-semibold mt-0.5 font-bold uppercase">Auto-Pay</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Ledger Entries (Read Only) */}
      <div className="glass-card p-5 border border-slate-200/50 dark:border-slate-800/40 bg-white/70 dark:bg-slate-900/70 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 tracking-tight uppercase">
            Recent Ledger Entries
          </h3>
          <Link 
            to="/transactions" 
            className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-650 hover:underline font-bold transition-all"
          >
            All Transactions <FaArrowRight size={8} />
          </Link>
        </div>

        {/* Transaction Table */}
        <TransactionTable
          transactions={transactions.slice(0, 5)} // Show only top 5 recent
          onViewDetails={handleViewDetails}
          readOnly={true}
        />
      </div>

      {/* Transaction Detail Viewer Modal */}
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

export default Dashboard;
