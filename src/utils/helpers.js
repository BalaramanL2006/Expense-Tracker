// Helper functions for the Expense Tracker application

// Format numbers as currency
export const formatCurrency = (value, currencyCode = 'USD', language = 'en-US') => {
  const formats = {
    'USD': { locale: 'en-US', symbol: '$' },
    'EUR': { locale: 'de-DE', symbol: '€' },
    'GBP': { locale: 'en-GB', symbol: '£' },
    'INR': { locale: 'en-IN', symbol: '₹' },
    'JPY': { locale: 'ja-JP', symbol: '¥' },
  };

  const selected = formats[currencyCode] || formats['USD'];
  
  return new Intl.NumberFormat(selected.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Format dates nicely
export const formatDate = (dateString, formatType = 'medium') => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  if (formatType === 'short') {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (formatType === 'time') {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  if (formatType === 'full') {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// Export JSON transactions data to CSV file
export const exportToCSV = (transactions, filename = 'expense_transactions.csv') => {
  const headers = ['Date', 'Title', 'Type', 'Category', 'Payment Method', 'Amount', 'Status', 'Recurring', 'Tags', 'Description'];
  
  const csvRows = [
    headers.join(','), // Header row
    ...transactions.map(t => {
      const dateStr = new Date(t.date).toLocaleDateString();
      const escapedTitle = `"${t.title.replace(/"/g, '""')}"`;
      const escapedDesc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const tagsStr = `"${(t.tags || []).join(';')}"`;
      
      return [
        dateStr,
        escapedTitle,
        t.type,
        t.category,
        t.paymentMethod,
        t.amount,
        t.status || 'Completed',
        t.recurring ? 'Yes' : 'No',
        tagsStr,
        escapedDesc
      ].join(',');
    })
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Parse imported CSV file string into transaction items
export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  // Detect comma or semicolon separator
  const separator = lines[0].includes(';') ? ';' : ',';
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Quick regex to split line by comma/semicolon, respecting quotes
    const regex = new RegExp(`\\s*${separator}\\s*(?=(?:[^"]*"[^"]*")*[^"]*$)`);
    const values = line.split(regex).map(val => val.replace(/^["']|["']$/g, '').trim());
    
    if (values.length < 5) continue; // Skip malformed rows
    
    const [dateVal, title, type, category, paymentMethod, amountVal, status, recurringVal, tagsVal, description] = values;
    
    // Parse values
    const dateParsed = new Date(dateVal);
    const date = isNaN(dateParsed.getTime()) ? new Date().toISOString() : dateParsed.toISOString();
    const typeClean = (type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
    const amount = parseFloat(amountVal) || 0;
    const recurring = (recurringVal || '').toLowerCase() === 'yes' || (recurringVal || '').toLowerCase() === 'true';
    const tags = tagsVal ? tagsVal.split(';').filter(t => t.trim() !== '') : [];

    results.push({
      id: `imported-${Date.now()}-${i}`,
      title: title || 'Imported Transaction',
      amount,
      type: typeClean,
      category: category || 'Others',
      date,
      description: description || '',
      paymentMethod: paymentMethod || 'Cash',
      recurring,
      tags: tags.length > 0 ? tags : ['Imported'],
      status: status || 'Completed',
      receiptImage: null
    });
  }
  
  return results;
};

// Generate print view stylesheet temporarily and trigger window.print
export const triggerPrint = (title = 'Report') => {
  const originalTitle = document.title;
  document.title = `${title}_${new Date().toLocaleDateString()}`;
  window.print();
  document.title = originalTitle;
};

// Calculate financial health score (0 - 100)
export const calculateFinancialScore = (income, expense, savingsGoalProgress) => {
  if (income <= 0) return 0;
  
  // 1. Savings rate score (weight: 50)
  const savingsRate = (income - expense) / income;
  let savingsScore = 0;
  if (savingsRate >= 0.4) savingsScore = 50; // saving 40%+ is excellent
  else if (savingsRate >= 0.2) savingsScore = 40; // 20-40% is good
  else if (savingsRate >= 0.1) savingsScore = 25; // 10-20% is average
  else if (savingsRate > 0) savingsScore = 10;
  else savingsScore = 0; // negative savings is dangerous
  
  // 2. Expense-to-income balance score (weight: 30)
  const ratio = expense / income;
  let ratioScore = 0;
  if (ratio < 0.5) ratioScore = 30;
  else if (ratio < 0.7) ratioScore = 20;
  else if (ratio < 0.9) ratioScore = 10;
  else ratioScore = 0;

  // 3. Savings Goal commitment score (weight: 20)
  const goalScore = Math.min(20, Math.floor(savingsGoalProgress * 20));

  return savingsScore + ratioScore + goalScore;
};

// Helper for generating custom gradient background classes matching type
export const getCategoryGradient = (categoryName, isDark = false) => {
  const gradients = {
    'Food': 'from-red-400 to-rose-500',
    'Travel': 'from-blue-400 to-indigo-500',
    'Shopping': 'from-pink-400 to-purple-500',
    'Bills': 'from-amber-400 to-orange-500',
    'Education': 'from-violet-400 to-indigo-600',
    'Health': 'from-emerald-400 to-teal-500',
    'Entertainment': 'from-rose-400 to-red-500',
    'Investment': 'from-indigo-400 to-purple-600',
    'Salary': 'from-emerald-400 to-green-600',
    'Business': 'from-teal-500 to-cyan-600',
    'Freelancing': 'from-cyan-400 to-blue-500',
    'Others': 'from-slate-400 to-slate-600'
  };

  return gradients[categoryName] || 'from-violet-400 to-fuchsia-500';
};
