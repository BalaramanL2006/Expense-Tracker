import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useExpense } from '../context/ExpenseContext';
import { useTheme } from '../context/ThemeContext';

// Custom Tooltip component for consistent glassmorphism formatting
const CustomTooltip = ({ active, payload, label, currency = 'USD' }) => {
  const { isDarkMode } = useTheme();
  if (active && payload && payload.length) {
    const formatVal = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
    return (
      <div className={`backdrop-blur-md p-3 rounded-xl shadow-xl border ${
        isDarkMode 
          ? 'bg-slate-900/95 border-slate-700 text-slate-100' 
          : 'bg-white/95 border-slate-200/50 text-slate-800'
      }`}>
        <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs font-semibold mt-0.5" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span>{formatVal(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 1. Income vs Expense Area Chart
export const IncomeExpenseChart = ({ data }) => {
  const { settings } = useExpense();
  const { isDarkMode } = useTheme();
  
  const gridStroke = isDarkMode ? '#334155' : '#E2E8F0';
  const labelColor = isDarkMode ? '#94A3B8' : '#64748B';
  const legendColor = isDarkMode ? '#F8FAFC' : '#0F172A';
  
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: labelColor, fontSize: 11 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: labelColor, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip currency={settings.currency} />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: 11, fontWeight: 'bold', color: legendColor }}
          />
          <Area 
            type="monotone" 
            dataKey="Income" 
            stroke="#10B981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
          />
          <Area 
            type="monotone" 
            dataKey="Expense" 
            stroke="#EF4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorExpense)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Category Expenditure Pie Chart
export const CategoryPieChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  const tooltipBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const tooltipBorder = isDarkMode ? '#475569' : '#E2E8F0';
  const textColor = isDarkMode ? '#F8FAFC' : '#0F172A';

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Spent']}
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderColor: tooltipBorder, 
              color: textColor, 
              borderRadius: 12, 
              fontSize: 11, 
              fontWeight: 'bold' 
            }}
            itemStyle={{ color: textColor }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 10, fontWeight: 'bold', paddingLeft: 10, color: textColor }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Weekly Spending Bar Chart
export const WeeklySpendingChart = ({ data }) => {
  const { settings } = useExpense();
  const { isDarkMode } = useTheme();
  
  const gridStroke = isDarkMode ? '#334155' : '#E2E8F0';
  const labelColor = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: labelColor, fontSize: 11 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: labelColor, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip currency={settings.currency} />} />
          <Bar 
            dataKey="Amount" 
            fill="#8B5CF6" 
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#8B5CF6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 4. Monthly Spend Trend Line Chart
export const MonthlyExpenseChart = ({ data }) => {
  const { settings } = useExpense();
  const { isDarkMode } = useTheme();
  
  const gridStroke = isDarkMode ? '#334155' : '#E2E8F0';
  const labelColor = isDarkMode ? '#94A3B8' : '#64748B';

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: labelColor, fontSize: 11 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: labelColor, fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip currency={settings.currency} />} />
          <Line 
            type="monotone" 
            dataKey="Amount" 
            name="Expenditure"
            stroke="#8B5CF6" 
            strokeWidth={3} 
            activeDot={{ r: 6 }} 
            dot={{ r: 3, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
