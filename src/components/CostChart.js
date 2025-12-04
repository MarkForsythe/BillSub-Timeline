import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CostChart = ({ bills, months, startDate, hoverMode, darkMode, getBillingChunks, getMonthStartDate, getTotalDays }) => {
  // Get all payment dates with their amounts and bill info
  const getPaymentDates = () => {
    const paymentMap = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    bills.forEach(bill => {
      if (!bill.active) return;
      const billChunks = getBillingChunks(bill);
      billChunks.forEach(chunk => {
        const chunkAmount = chunk.amount || bill.amount;
        const paymentDate = new Date(chunk.end);
        paymentDate.setHours(0, 0, 0, 0);
        
        // Only include future payments
        if (paymentDate >= today) {
          const dateKey = paymentDate.getTime();
          const dateStr = paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          if (!paymentMap.has(dateKey)) {
            paymentMap.set(dateKey, {
              date: paymentDate,
              dateStr: dateStr,
              payments: []
            });
          }
          paymentMap.get(dateKey).payments.push({
            amount: chunkAmount,
            color: bill.color,
            name: bill.name
          });
        }
      });
    });
    
    return Array.from(paymentMap.values()).sort((a, b) => a.date - b.date);
  };
  
  const paymentDates = getPaymentDates();
  // Create a map for quick lookup by date string
  const paymentDatesMap = new Map();
  paymentDates.forEach(p => {
    paymentDatesMap.set(p.dateStr, p);
  });
  // Calculate data points for the chart
  const getChartData = () => {
    const data = [];
    const firstMonth = getMonthStartDate(0);
    const lastMonth = getMonthStartDate(months - 1);
    const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalDays = getTotalDays();
    
    // Generate data points for each day
    const currentDate = new Date(firstMonth);
    while (currentDate <= lastDay) {
      const dateStr = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Calculate cumulative cost for this date
      let total = 0;
      
      if (hoverMode === 'current') {
        const daysFromToday = (currentDate - today) / (1000 * 60 * 60 * 24);
        
        // Collect all bills with their due dates
        const allBills = [];
        bills.forEach(bill => {
          if (!bill.active) return;
          const billChunks = getBillingChunks(bill);
          billChunks.forEach(chunk => {
            const chunkAmount = chunk.amount || bill.amount;
            const daysUntilDue = (chunk.end - today) / (1000 * 60 * 60 * 24);
            
            if (daysUntilDue > 0) {
              allBills.push({
                amount: chunkAmount,
                dueDate: chunk.end,
                daysUntilDue: daysUntilDue
              });
            }
          });
        });
        
        // Sort by due date
        allBills.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
        
        if (allBills.length === 0) {
          total = 0;
        } else {
          // Find which interval we're in
          let cumulativePaid = 0;
          let prevDueDate = 0;
          
          for (let i = 0; i < allBills.length; i++) {
            const bill = allBills[i];
            
            if (daysFromToday >= bill.daysUntilDue) {
              // This bill is already due - count it fully
              cumulativePaid += bill.amount;
              prevDueDate = bill.daysUntilDue;
            } else {
              // We're in the interval before this bill is due
              // Calculate slope: amount / (days until due - previous due date)
              const intervalDays = bill.daysUntilDue - prevDueDate;
              if (intervalDays > 0) {
                const slope = bill.amount / intervalDays;
                const daysInInterval = daysFromToday - prevDueDate;
                total = cumulativePaid + (slope * daysInInterval);
              } else {
                total = cumulativePaid;
              }
              break;
            }
          }
          
          // If we've passed all bills, just sum them all
          if (daysFromToday >= allBills[allBills.length - 1].daysUntilDue) {
            total = allBills.reduce((sum, bill) => sum + bill.amount, 0);
          }
        }
      } else if (hoverMode === 'future') {
        bills.forEach(bill => {
          if (!bill.active) return;
          const billChunks = getBillingChunks(bill);
          billChunks.forEach(chunk => {
            const chunkStart = chunk.start > today ? chunk.start : today;
            const chunkEnd = chunk.end < currentDate ? chunk.end : currentDate;
            if (chunkStart < chunkEnd && chunkStart < currentDate && chunkEnd > today) {
              const chunkDays = (chunk.end - chunk.start) / (1000 * 60 * 60 * 24);
              const includedDays = (chunkEnd - chunkStart) / (1000 * 60 * 60 * 24);
              if (chunkDays > 0) {
                const proportion = includedDays / chunkDays;
                total += (chunk.amount || bill.amount) * proportion;
              }
            }
          });
        });
      }
      
      data.push({
        date: dateStr,
        cost: total,
        timestamp: currentDate.getTime()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };
  
  const chartData = getChartData();
  const firstMonth = getMonthStartDate(0);
  const lastMonth = getMonthStartDate(months - 1);
  const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);
  
  // Custom tick component for payment dates
  const CustomTick = ({ x, y, payload }) => {
    const dateStr = payload.value;
    
    // Find if this date matches any payment date
    const paymentInfo = paymentDatesMap.get(dateStr);
    
    // Only render if it's a payment date
    if (!paymentInfo) {
      return <g></g>; // Return empty group instead of null
    }
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill={darkMode ? '#9ca3af' : '#6b7280'}
          fontSize={10}
          fontWeight={500}
        >
          {dateStr}
        </text>
        {/* Render amounts below, stacked if multiple */}
        {paymentInfo.payments.map((payment, idx) => (
          <text
            key={idx}
            x={0}
            y={0}
            dy={30 + (idx * 14)}
            textAnchor="middle"
            fill={payment.color}
            fontSize={9}
            fontWeight={600}
          >
            -${payment.amount.toFixed(0)}
          </text>
        ))}
      </g>
    );
  };
  
  return (
    <div className={`h-full flex flex-col rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="px-4 pt-4 flex-shrink-0">
        <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Cumulative Cost Over Time ({hoverMode === 'current' ? 'Current' : hoverMode === 'future' ? 'Future Only' : 'Include Past'})
        </h3>
      </div>
      <div className="flex-1 min-h-0" style={{ paddingLeft: '140px', paddingRight: '16px', paddingBottom: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData}
            margin={{ left: 0, right: 0, top: 5, bottom: 80 }}
          >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="date" 
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            tick={<CustomTick />}
            ticks={paymentDates.map(p => p.dateStr)}
            height={80}
          />
          <YAxis 
            stroke={darkMode ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            width={60}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: darkMode ? '#374151' : '#fff',
              border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
              borderRadius: '6px',
              color: darkMode ? '#f3f4f6' : '#111827'
            }}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
          />
          <Line 
            type="monotone" 
            dataKey="cost" 
            stroke={darkMode ? '#3b82f6' : '#2563eb'} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CostChart;

