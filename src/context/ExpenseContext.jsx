import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateMockTransactions, DEFAULT_CATEGORIES } from '../utils/mockData';

const ExpenseContext = createContext();

const LOCAL_TXNS_KEY = 'expense_app_transactions';
const LOCAL_CATS_KEY = 'expense_app_categories';
const LOCAL_BUDGETS_KEY = 'expense_app_budgets';
const LOCAL_GOALS_KEY = 'expense_app_goals';
const LOCAL_NOTIFS_KEY = 'expense_app_notifications';
const LOCAL_SETTING_KEY = 'expense_app_settings';

export const ExpenseProvider = ({ children }) => {
  // --- STATE INIT ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState({
    currency: 'USD',
    language: 'en',
    notificationPrefs: {
      budgetExceeded: true,
      goalCompleted: true,
      largeExpense: true,
      upcomingBill: true,
      recurringPay: true
    }
  });

  // --- INITIAL LOAD & LOCAL STORAGE SYNC ---
  useEffect(() => {
    // Transactions
    const localTxns = localStorage.getItem(LOCAL_TXNS_KEY);
    if (localTxns) {
      setTransactions(JSON.parse(localTxns));
    } else {
      const generated = generateMockTransactions();
      setTransactions(generated);
      localStorage.setItem(LOCAL_TXNS_KEY, JSON.stringify(generated));
    }

    // Categories
    const localCats = localStorage.getItem(LOCAL_CATS_KEY);
    if (localCats) {
      setCategories(JSON.parse(localCats));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }

    // Budgets
    const localBudgets = localStorage.getItem(LOCAL_BUDGETS_KEY);
    if (localBudgets) {
      setBudgets(JSON.parse(localBudgets));
    } else {
      const initialBudgets = [
        { id: 'b-1', category: 'Food', amount: 600, period: 'monthly' },
        { id: 'b-2', category: 'Travel', amount: 300, period: 'monthly' },
        { id: 'b-3', category: 'Entertainment', amount: 200, period: 'monthly' },
        { id: 'b-4', category: 'Shopping', amount: 400, period: 'monthly' }
      ];
      setBudgets(initialBudgets);
      localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(initialBudgets));
    }

    // Goals
    const localGoals = localStorage.getItem(LOCAL_GOALS_KEY);
    if (localGoals) {
      setGoals(JSON.parse(localGoals));
    } else {
      const initialGoals = [
        { id: 'g-1', title: 'Emergency Fund', targetAmount: 5000, currentAmount: 3200, deadline: '2026-12-31' },
        { id: 'g-2', title: 'Europe Vacation', targetAmount: 3500, currentAmount: 1800, deadline: '2026-09-30' },
        { id: 'g-3', title: 'Tesla Down Payment', targetAmount: 10000, currentAmount: 2500, deadline: '2027-06-30' }
      ];
      setGoals(initialGoals);
      localStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(initialGoals));
    }

    // Notifications
    const localNotifs = localStorage.getItem(LOCAL_NOTIFS_KEY);
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    } else {
      const initialNotifs = [
        { id: 'n-1', message: 'Welcome to your Expense Tracker! Setup your first savings goal.', type: 'info', date: new Date().toISOString(), read: false },
        { id: 'n-2', message: 'Budget Alert: You have used 85% of your Food budget.', type: 'budget_warning', date: new Date().toISOString(), read: false }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(initialNotifs));
    }

    // Settings
    const localSettings = localStorage.getItem(LOCAL_SETTING_KEY);
    if (localSettings) {
      setSettings(JSON.parse(localSettings));
    }
  }, []);

  // --- SAVE TO LOCALSTORAGE METHODS ---
  const saveTxns = (list) => {
    setTransactions(list);
    localStorage.setItem(LOCAL_TXNS_KEY, JSON.stringify(list));
  };

  const saveCats = (list) => {
    setCategories(list);
    localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(list));
  };

  const saveBudgets = (list) => {
    setBudgets(list);
    localStorage.setItem(LOCAL_BUDGETS_KEY, JSON.stringify(list));
  };

  const saveGoals = (list) => {
    setGoals(list);
    localStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(list));
  };

  const saveNotifs = (list) => {
    setNotifications(list);
    localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(list));
  };

  const saveSettings = (obj) => {
    setSettings(obj);
    localStorage.setItem(LOCAL_SETTING_KEY, JSON.stringify(obj));
  };

  // --- TOAST NOTIFICATIONS HELPER ---
  const triggerToast = (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Automatically fade out after 3.5s
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- NOTIFICATION PUSH HELPER ---
  const pushNotification = (message, type) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };
    saveNotifs([newNotif, ...notifications]);
    triggerToast(message, type === 'budget_warning' ? 'warning' : 'info');
  };

  // --- ACTIONS ---

  // Transactions CRUD
  const addTransaction = (txn) => {
    const newTxn = {
      ...txn,
      id: txn.id || `txn-${Date.now()}`,
      status: txn.status || 'Completed',
      date: txn.date || new Date().toISOString()
    };
    const updated = [newTxn, ...transactions];
    saveTxns(updated);
    
    // 1. Budget Alerts Check
    if (newTxn.type === 'expense' && settings.notificationPrefs.budgetExceeded) {
      checkBudgetsAfterExpense(newTxn, updated);
    }

    // 2. Large Expense Alert Check (e.g. > $1000)
    if (newTxn.type === 'expense' && newTxn.amount >= 1000 && settings.notificationPrefs.largeExpense) {
      pushNotification(`Large expense alert: You spent ${formatVal(newTxn.amount)} on "${newTxn.title}"`, 'large_expense');
    }

    triggerToast('Transaction added successfully!');
  };

  const editTransaction = (id, updatedFields) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updatedFields } : t);
    saveTxns(updated);
    triggerToast('Transaction updated successfully!');
  };

  const deleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    saveTxns(updated);
    triggerToast('Transaction deleted successfully!');
  };

  const duplicateTransaction = (id) => {
    const original = transactions.find(t => t.id === id);
    if (original) {
      const duplicated = {
        ...original,
        id: `txn-dup-${Date.now()}`,
        title: `${original.title} (Copy)`,
        date: new Date().toISOString()
      };
      saveTxns([duplicated, ...transactions]);
      triggerToast('Transaction duplicated!');
    }
  };

  const bulkDeleteTransactions = (ids) => {
    const updated = transactions.filter(t => !ids.includes(t.id));
    saveTxns(updated);
    triggerToast(`Successfully deleted ${ids.length} transactions!`);
  };

  const importTransactions = (importedList) => {
    const updated = [...importedList, ...transactions];
    saveTxns(updated);
    triggerToast(`Imported ${importedList.length} transactions from CSV!`);
  };

  // Check budgets progress
  const checkBudgetsAfterExpense = (newTxn, updatedTransactions) => {
    const txnMonth = new Date(newTxn.date).getMonth();
    const txnYear = new Date(newTxn.date).getFullYear();

    // Get budgets matching the category or all-category
    const relevantBudgets = budgets.filter(b => b.category === newTxn.category || b.category === 'All');

    relevantBudgets.forEach(b => {
      // Calculate current spent in this category for this month
      const spent = updatedTransactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' &&
            (b.category === 'All' || t.category === b.category) &&
            tDate.getMonth() === txnMonth &&
            tDate.getFullYear() === txnYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      if (spent > b.amount) {
        pushNotification(`Budget exceeded! You spent ${formatVal(spent)} of your ${formatVal(b.amount)} ${b.category} budget limit.`, 'budget_warning');
      } else if (spent >= b.amount * 0.85) {
        pushNotification(`Budget warning: You reached 85% of your ${b.category} budget limit.`, 'budget_warning');
      }
    });
  };

  // Helper formatter for local currency representation
  const formatVal = (amt) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(amt);
  };

  // Categories CRUD
  const addCategory = (cat) => {
    const newCat = {
      ...cat,
      id: `cat-${Date.now()}`,
      isCustom: true
    };
    saveCats([...categories, newCat]);
    triggerToast('Custom category created!');
  };

  // Budgets CRUD
  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: `b-${Date.now()}`
    };
    saveBudgets([...budgets, newBudget]);
    triggerToast('Budget created successfully!');
  };

  const editBudget = (id, updatedFields) => {
    saveBudgets(budgets.map(b => b.id === id ? { ...b, ...updatedFields } : b));
    triggerToast('Budget updated successfully!');
  };

  const deleteBudget = (id) => {
    saveBudgets(budgets.filter(b => b.id !== id));
    triggerToast('Budget deleted!');
  };

  // Savings Goals CRUD
  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: `g-${Date.now()}`,
      currentAmount: parseFloat(goal.currentAmount) || 0
    };
    saveGoals([...goals, newGoal]);
    triggerToast('Savings goal created!');
  };

  const editGoal = (id, updatedFields) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        const goal = { ...g, ...updatedFields };
        // Check if goal just got completed
        if (goal.currentAmount >= goal.targetAmount && g.currentAmount < g.targetAmount && settings.notificationPrefs.goalCompleted) {
          setTimeout(() => {
            pushNotification(`Savings goal achieved! You completed your target for "${goal.title}"`, 'goal_achieved');
          }, 300);
        }
        return goal;
      }
      return g;
    });
    saveGoals(updated);
    triggerToast('Goal updated!');
  };

  const deleteGoal = (id) => {
    saveGoals(goals.filter(g => g.id !== id));
    triggerToast('Savings goal deleted.');
  };

  // Notifications
  const markNotificationAsRead = (id) => {
    saveNotifs(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    saveNotifs([]);
    triggerToast('All notifications cleared.');
  };

  // Settings
  const updateSettings = (newSettings) => {
    saveSettings({ ...settings, ...newSettings });
    triggerToast('Preferences saved.');
  };

  // Backup & Restore
  const backupData = () => {
    const backupObj = {
      transactions,
      categories,
      budgets,
      goals,
      notifications,
      settings
    };
    return JSON.stringify(backupObj);
  };

  const restoreData = (jsonStr) => {
    try {
      const restored = JSON.parse(jsonStr);
      if (restored.transactions) saveTxns(restored.transactions);
      if (restored.categories) saveCats(restored.categories);
      if (restored.budgets) saveBudgets(restored.budgets);
      if (restored.goals) saveGoals(restored.goals);
      if (restored.notifications) saveNotifs(restored.notifications);
      if (restored.settings) saveSettings(restored.settings);
      triggerToast('All data successfully restored from backup!', 'success');
      return true;
    } catch (e) {
      triggerToast('Failed to restore backup: Invalid JSON syntax', 'error');
      return false;
    }
  };

  // Delete all data
  const deleteAccount = () => {
    localStorage.removeItem(LOCAL_TXNS_KEY);
    localStorage.removeItem(LOCAL_CATS_KEY);
    localStorage.removeItem(LOCAL_BUDGETS_KEY);
    localStorage.removeItem(LOCAL_GOALS_KEY);
    localStorage.removeItem(LOCAL_NOTIFS_KEY);
    localStorage.removeItem(LOCAL_SETTING_KEY);
    
    // Reset to defaults
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setBudgets([]);
    setGoals([]);
    setNotifications([]);
    
    triggerToast('Account data reset completed successfully!', 'success');
  };

  return (
    <ExpenseContext.Provider value={{
      transactions,
      categories,
      budgets,
      goals,
      notifications,
      toasts,
      settings,
      triggerToast,
      removeToast,
      addTransaction,
      editTransaction,
      deleteTransaction,
      duplicateTransaction,
      bulkDeleteTransactions,
      importTransactions,
      addCategory,
      addBudget,
      editBudget,
      deleteBudget,
      addGoal,
      editGoal,
      deleteGoal,
      markNotificationAsRead,
      clearAllNotifications,
      updateSettings,
      backupData,
      restoreData,
      deleteAccount
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
