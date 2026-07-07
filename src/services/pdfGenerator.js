import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../utils/helpers';
import { APP_NAME } from '../utils/constants';

export const generatePDF = (user, transactions = [], budgets = [], goals = [], reportType = 'Ledger', startDate = '', endDate = '') => {
  // Create jsPDF document instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Unique report ID
  const dateStr = new Date().toISOString().substring(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const reportId = `EXP-${dateStr}-${rand}`;

  // Formatted date and time
  const localDate = new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });
  const localTime = new Date().toLocaleTimeString('en-IN', { timeStyle: 'medium' });

  // Calculate statistics in Indian Rupees (INR)
  const incomeItems = transactions.filter(t => t.type === 'income');
  const expenseItems = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeItems.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseItems.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const savingsRateStr = `${Math.max(0, savingsRate).toFixed(1)}%`;

  // Define columns as expected by jspdf-autotable
  const columns = [
    { header: 'Date', dataKey: 'date' },
    { header: 'Title', dataKey: 'title' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Payment Method', dataKey: 'method' },
    { header: 'Type', dataKey: 'type' },
    { header: 'Amount', dataKey: 'amount' },
    { header: 'Status', dataKey: 'status' }
  ];

  // Map transaction rows
  const rows = transactions.map(t => ({
    date: formatDate(t.date),
    title: t.title,
    category: t.category,
    method: t.paymentMethod,
    type: t.type.toUpperCase(),
    amount: `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, 'INR', 'en-IN')}`,
    status: (t.status || 'Completed').toUpperCase()
  }));

  // Define layout configurations
  const pageMargin = 20; // 20mm margins
  const contentWidth = doc.internal.pageSize.width - (pageMargin * 2);

  // Helper for line drawing
  const drawLine = (yVal) => {
    doc.setDrawColor(226, 232, 240); // light gray border (#E2E8F0)
    doc.setLineWidth(0.5);
    doc.line(pageMargin, yVal, doc.internal.pageSize.width - pageMargin, yVal);
  };

  // Header position
  let y = pageMargin;

  // Title block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900 (#0F172A)
  doc.text(APP_NAME, pageMargin, y);
  
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500 (#64748B)
  doc.text('TRANSACTION LEDGER REPORT', pageMargin, y);

  y += 8;
  drawLine(y);

  // Metadata block
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400 (#94A3B8)
  doc.text('GENERATED DATE:', pageMargin, y);
  doc.text('GENERATED TIME:', pageMargin + 50, y);
  doc.text('PREPARED FOR:', pageMargin + 100, y);
  doc.text('REPORT ID:', pageMargin + 145, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59); // slate-800 (#1E293B)
  
  doc.text(localDate, pageMargin, y);
  doc.text(localTime, pageMargin + 50, y);
  doc.text(user?.name || 'Authorized Account User', pageMargin + 100, y);
  doc.setFont('helvetica', 'bold');
  doc.text(reportId, pageMargin + 145, y);

  y += 7;
  drawLine(y);

  // Period / Filter Info
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Statement Period: ${reportType}`, pageMargin, y);
  
  if (startDate || endDate) {
    const limitsText = `Range: ${startDate ? formatDate(startDate) : 'Beginning'} - ${endDate ? formatDate(endDate) : 'Today'}`;
    doc.setFont('helvetica', 'normal');
    doc.text(limitsText, doc.internal.pageSize.width - pageMargin - doc.getTextWidth(limitsText), y);
  }

  y += 5;

  // 2. FINANCIAL SUMMARY CARD
  y += 3;
  doc.setFillColor(248, 250, 252); // slate-50 (#F8FAFC)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageMargin, y, contentWidth, 24, 3, 3, 'FD');

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('TOTAL INCOME', pageMargin + 8, y);
  doc.text('TOTAL EXPENSE', pageMargin + 48, y);
  doc.text('CURRENT BALANCE', pageMargin + 88, y);
  doc.text('SAVINGS RATE', pageMargin + 138, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  
  // Income in green
  doc.setTextColor(34, 197, 94); 
  doc.text(formatCurrency(totalIncome, 'INR', 'en-IN'), pageMargin + 8, y);
  
  // Expense in red
  doc.setTextColor(239, 68, 68);
  doc.text(formatCurrency(totalExpense, 'INR', 'en-IN'), pageMargin + 48, y);
  
  // Balance
  if (netBalance >= 0) {
    doc.setTextColor(34, 197, 94);
  } else {
    doc.setTextColor(239, 68, 68);
  }
  doc.text((netBalance >= 0 ? '+' : '') + formatCurrency(netBalance, 'INR', 'en-IN'), pageMargin + 88, y);
  
  // Savings rate
  doc.setTextColor(124, 58, 237); // violet-600 #7C3AED
  doc.text(savingsRateStr, pageMargin + 138, y);

  y += 18;

  // 3. TRANSACTIONS TABLE
  autoTable(doc, {
    columns: columns,
    body: rows,
    startY: y,
    margin: { top: 25, bottom: 25, left: pageMargin, right: pageMargin },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 4,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [124, 58, 237], // primary color #7C3AED
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // alternating rows #F8FAFC
    },
    columnStyles: {
      amount: { halign: 'right', fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      // Draw footer on every page
      const totalPages = doc.internal.getNumberOfPages();
      const currentPage = data.pageNumber;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      
      // Footer border line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(pageMargin, doc.internal.pageSize.height - 18, doc.internal.pageSize.width - pageMargin, doc.internal.pageSize.height - 18);

      const footerY = doc.internal.pageSize.height - 12;
      doc.text(APP_NAME, pageMargin, footerY);
      
      const pageNumText = `Page ${currentPage} of ${totalPages}`;
      doc.text(pageNumText, doc.internal.pageSize.width - pageMargin - doc.getTextWidth(pageNumText), footerY);
    }
  });

  // Summary lines at the bottom of the table
  const finalY = doc.lastAutoTable.finalY || y;
  let summaryY = finalY + 12;
  
  if (summaryY > doc.internal.pageSize.height - 30) {
    doc.addPage();
    summaryY = pageMargin + 10;
  }
  
  drawLine(summaryY - 4);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(`Total Transactions: ${transactions.length}`, pageMargin, summaryY);
  
  summaryY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Generated by:', pageMargin, summaryY);
  
  summaryY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(124, 58, 237); // primary color
  doc.text(APP_NAME, pageMargin, summaryY);

  // Trigger download exactly using the formatting YYYY-MM-DD
  const todayStr = new Date().toISOString().substring(0, 10);
  const safeFilename = `Transaction_Ledger_${todayStr}.pdf`;
  doc.save(safeFilename);
};
