// Default category definitions with associated colors and icon keys for React Icons mapping
export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Food', type: 'expense', icon: 'FaUtensils', color: '#EF4444' },
  { id: 'cat-2', name: 'Travel', type: 'expense', icon: 'FaCar', color: '#3B82F6' },
  { id: 'cat-3', name: 'Shopping', type: 'expense', icon: 'FaShoppingBag', color: '#EC4899' },
  { id: 'cat-4', name: 'Bills', type: 'expense', icon: 'FaFileInvoiceDollar', color: '#F59E0B' },
  { id: 'cat-5', name: 'Education', type: 'expense', icon: 'FaGraduationCap', color: '#8B5CF6' },
  { id: 'cat-6', name: 'Health', type: 'expense', icon: 'FaHeartbeat', color: '#10B981' },
  { id: 'cat-7', name: 'Entertainment', type: 'expense', icon: 'FaGamepad', color: '#F43F5E' },
  { id: 'cat-8', name: 'Investment', type: 'expense', icon: 'FaChartLine', color: '#6366F1' },
  { id: 'cat-9', name: 'Salary', type: 'income', icon: 'FaWallet', color: '#10B981' },
  { id: 'cat-10', name: 'Business', type: 'income', icon: 'FaBriefcase', color: '#059669' },
  { id: 'cat-11', name: 'Freelancing', type: 'income', icon: 'FaLaptopCode', color: '#06B6D4' },
  { id: 'cat-12', name: 'Others', type: 'expense', icon: 'FaEllipsisH', color: '#6B7280' },
];

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'PayPal'];

// Helper to get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number in range
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 150 realistic transactions spanning the past 6 months
export const generateMockTransactions = () => {
  const transactions = [];
  const now = new Date();
  
  // Specific titles for expenses
  const expenseTitles = {
    'Food': ['Whole Foods grocery run', 'Starbucks Coffee', 'UberEats delivery', 'Dinner at Trattoria', 'Sushi bar lunch', 'Snacks from 7-Eleven'],
    'Travel': ['Shell petrol refill', 'Uber ride to office', 'Metro monthly pass', 'Flight tickets to Chicago', 'Hotel booking', 'Train ticket'],
    'Shopping': ['Amazon purchase - electronics', 'Zara summer jacket', 'Nike sports sneakers', 'Home Depot tools', 'IKEA dining table', 'Target home decor'],
    'Bills': ['Electricity bill', 'Water utility payment', 'Verizon WiFi subscription', 'Netflix premium plan', 'Spotify family pack', 'Mobile recharge'],
    'Education': ['Udemy course - React & NodeJS', 'Book store - Sci-Fi novels', 'Scientific journal subscription', 'Coursera subscription'],
    'Health': ['CVS pharmacy medicines', 'Dentist general checkup', 'Gym monthly membership', 'Optician prescription glasses', 'First aid kit'],
    'Entertainment': ['AMC cinema tickets', 'Steam games discount sale', 'Bowling alley with friends', 'Concert tickets', 'Escape room activity'],
    'Investment': ['S&P 500 Index fund', 'ETF monthly purchase', 'Gold savings plan', 'Crypto purchase (ETH)'],
    'Others': ['Dry cleaning service', 'Key replacement', 'Gift wrapping', 'Postage stamp mailing', 'Charity donation']
  };

  // Specific titles for incomes
  const incomeTitles = {
    'Salary': ['Monthly Tech Corp Salary', 'Semimonthly Paycheck', 'Annual Performance Bonus'],
    'Business': ['Product sales revenue', 'SaaS subscription payouts', 'AdSense ad revenue', 'E-commerce profits'],
    'Freelancing': ['Upwork web app development UI', 'Fiverr logo branding design', 'Consulting consultation fee', 'Writing tech tutorial draft']
  };

  // Tags list
  const tagsList = ['Essential', 'Leisure', 'Business', 'Work', 'Holiday', 'Tax-Deductible', 'Subscription', 'Family', 'Gift'];

  // Start generation
  for (let i = 1; i <= 150; i++) {
    // 80% chance of expense, 20% chance of income for realistic cash flow
    const isIncome = Math.random() < 0.22;
    const type = isIncome ? 'income' : 'expense';
    
    // Select category matching the type
    const possibleCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);
    const categoryObj = randomItem(possibleCategories);
    const category = categoryObj.name;
    
    // Select title matching category
    const titles = isIncome ? incomeTitles[category] : expenseTitles[category];
    const title = randomItem(titles) || `${category} Transaction #${i}`;

    // Select amount
    let amount = 0;
    if (type === 'income') {
      if (category === 'Salary') {
        amount = randomItem([3200, 4500, 5200, 6000]); // Stable high salaries
      } else if (category === 'Business') {
        amount = randomRange(800, 3000);
      } else { // Freelancing
        amount = randomRange(150, 1200);
      }
    } else { // expense
      if (category === 'Food') {
        amount = randomRange(10, 180);
      } else if (category === 'Travel') {
        amount = randomRange(15, 800); // 800 is flight, others are petrol
      } else if (category === 'Shopping') {
        amount = randomRange(30, 600);
      } else if (category === 'Bills') {
        amount = randomItem([12, 15, 45, 95, 120, 240]); // typical bill amounts
      } else if (category === 'Education') {
        amount = randomRange(20, 150);
      } else if (category === 'Health') {
        amount = randomRange(15, 300);
      } else if (category === 'Entertainment') {
        amount = randomRange(10, 150);
      } else if (category === 'Investment') {
        amount = randomRange(100, 1000);
      } else { // Others
        amount = randomRange(5, 100);
      }
    }

    // Set dates distributed over the last 180 days (6 months)
    const dateOffset = randomRange(0, 180);
    const txnDate = new Date();
    txnDate.setDate(now.getDate() - dateOffset);
    // Distribute hours realistically
    txnDate.setHours(randomRange(8, 22), randomRange(0, 59), 0, 0);

    const paymentMethod = randomItem(PAYMENT_METHODS);
    
    // Recurring chance (10%)
    const recurring = type === 'expense' && (category === 'Bills' || category === 'Entertainment' && Math.random() < 0.25);
    
    // 1-2 random tags
    const numTags = randomRange(1, 2);
    const tags = [];
    while (tags.length < numTags) {
      const tag = randomItem(tagsList);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    const description = `This is a transaction record for ${title} via ${paymentMethod} on ${txnDate.toLocaleDateString()}.`;

    // 10% chance of mock receipt image url
    const hasReceipt = type === 'expense' && Math.random() < 0.15;
    const receiptImage = hasReceipt 
      ? `https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop` 
      : null;

    transactions.push({
      id: `txn-${1000 + i}`,
      title,
      amount,
      type,
      category,
      date: txnDate.toISOString(),
      description,
      paymentMethod,
      recurring,
      tags,
      receiptImage,
      status: 'Completed'
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};
