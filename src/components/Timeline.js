import React, { useState } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import CostChart from './CostChart';

const Timeline = ({ bills, months, startDate, darkMode, onToggleActive, onDelete, onUpdateBill, onMoveBill, hoverMode = 'current', showChart = false }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [cumulativeCost, setCumulativeCost] = useState(0);
  const getMonthStartDate = (monthOffset) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthOffset);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get all unique payment dates from bills
  const getPaymentDates = () => {
    const dates = new Set();
    bills.forEach(bill => {
      dates.add(bill.paymentDate);
    });
    return Array.from(dates).sort((a, b) => a - b);
  };

  // Calculate total days across all visible months
  const getTotalDays = () => {
    let total = 0;
    for (let i = 0; i < months; i++) {
      const monthDate = getMonthStartDate(i);
      total += getDaysInMonth(monthDate);
    }
    return total;
  };

  // Get position of a date in the timeline (0 to totalDays)
  const getDatePosition = (date, firstMonth) => {
    const daysDiff = Math.floor((date - firstMonth) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(daysDiff, getTotalDays()));
  };

  // Calculate billing chunks for a bill - completely rewritten
  const getBillingChunks = (bill) => {
    const chunks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstMonth = getMonthStartDate(0);
    const lastMonth = getMonthStartDate(months - 1);
    const lastDay = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    // Find the most recent payment date before or on today
    let currentPaymentDate = new Date(today);
    currentPaymentDate.setDate(bill.paymentDate);
    currentPaymentDate.setHours(0, 0, 0, 0);
    
    // If payment date hasn't occurred this month, go back to last month
    if (currentPaymentDate > today) {
      currentPaymentDate.setMonth(currentPaymentDate.getMonth() - 1);
      currentPaymentDate.setDate(bill.paymentDate);
    }
    
    // Calculate the start of the current billing cycle
    const currentCycleStart = new Date(currentPaymentDate);
    const currentCycleEnd = new Date(currentCycleStart);
    currentCycleEnd.setMonth(currentCycleEnd.getMonth() + 1);
    currentCycleEnd.setDate(bill.paymentDate);
    currentCycleEnd.setHours(0, 0, 0, 0);
    
    // If we're in an active cycle and today is within the timeline, add the remainder chunk
    if (today >= currentCycleStart && today < currentCycleEnd) {
      const remainderStart = today < firstMonth ? firstMonth : today;
      const remainderEnd = currentCycleEnd > lastDay ? lastDay : currentCycleEnd;
      
      if (remainderStart < remainderEnd && remainderStart <= lastDay && remainderEnd >= firstMonth) {
        // Check if this chunk is after the future amount date
        let chunkAmount = bill.amount;
        let isAfterFutureAmount = false;
        
        if (bill.futureAmount && bill.futureAmountDate) {
          const futureDate = new Date(bill.futureAmountDate);
          futureDate.setHours(0, 0, 0, 0);
          if (remainderStart >= futureDate) {
            chunkAmount = bill.futureAmount;
            isAfterFutureAmount = true;
          }
        }
        
        // For deactivated bills, the first chunk (current cycle) should be active to show remaining time
        // After the cycle ends, subsequent chunks will be inactive (grey)
        const isFirstChunkActive = bill.active || (today >= currentCycleStart && today < currentCycleEnd);
        
        chunks.push({
          start: new Date(remainderStart),
          end: new Date(remainderEnd),
          isActive: isFirstChunkActive,
          isRemainder: true,
          isFirstChunk: true,
          amount: chunkAmount,
          isAfterFutureAmount
        });
      }
    }
    
    // Generate all future monthly cycles
    let cycleStart = new Date(currentCycleEnd);
    cycleStart.setHours(0, 0, 0, 0);
    
    while (cycleStart <= lastDay) {
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);
      cycleEnd.setDate(bill.paymentDate);
      cycleEnd.setHours(0, 0, 0, 0);
      
      // Clamp to timeline bounds
      const chunkStart = cycleStart < firstMonth ? firstMonth : cycleStart;
      const chunkEnd = cycleEnd > lastDay ? lastDay : cycleEnd;
      
      // Only add if it overlaps with the timeline and has width
      if (chunkStart < chunkEnd && chunkStart <= lastDay && chunkEnd >= firstMonth) {
        // Check if this chunk is after the future amount date
        let chunkAmount = bill.amount;
        let isAfterFutureAmount = false;
        
        if (bill.futureAmount && bill.futureAmountDate) {
          const futureDate = new Date(bill.futureAmountDate);
          futureDate.setHours(0, 0, 0, 0);
          if (chunkStart >= futureDate) {
            chunkAmount = bill.futureAmount;
            isAfterFutureAmount = true;
          }
        }
        
        chunks.push({
          start: new Date(chunkStart),
          end: new Date(chunkEnd),
          isActive: bill.active,
          isRemainder: false,
          isFirstChunk: false,
          amount: chunkAmount,
          isAfterFutureAmount
        });
      }
      
      // Move to next cycle (next month, same day)
      cycleStart = new Date(cycleEnd);
    }
    
    return chunks;
  };

  // Convert hex to RGB for gradient
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };

  // Create gradient from color
  const createGradient = (color, isActive) => {
    const rgb = hexToRgb(color);
    if (!isActive) {
      return `linear-gradient(135deg, rgba(${rgb.r * 0.3}, ${rgb.g * 0.3}, ${rgb.b * 0.3}, 0.8) 0%, rgba(${rgb.r * 0.2}, ${rgb.g * 0.2}, ${rgb.b * 0.2}, 0.6) 100%)`;
    }
    return `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1) 0%, rgba(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)}, 1) 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.95) 100%)`;
  };

  const firstMonth = getMonthStartDate(0);
  const totalDays = getTotalDays();
  const paymentDates = getPaymentDates();

  // Calculate month boundary positions
  const getMonthBoundaries = () => {
    const boundaries = [];
    let cumulativeDays = 0;
    
    for (let i = 0; i <= months; i++) {
      if (i === 0) {
        boundaries.push({ position: 0 });
      } else {
        const prevMonth = getMonthStartDate(i - 1);
        cumulativeDays += getDaysInMonth(prevMonth);
        boundaries.push({ 
          position: (cumulativeDays / totalDays) * 100
        });
      }
    }
    return boundaries;
  };

  const monthBoundaries = getMonthBoundaries();

  // Calculate month header positions based on actual days
  const getMonthHeaderPositions = () => {
    const positions = [];
    let cumulativeDays = 0;
    
    for (let i = 0; i < months; i++) {
      const monthDate = getMonthStartDate(i);
      const daysInMonth = getDaysInMonth(monthDate);
      const startPercent = (cumulativeDays / totalDays) * 100;
      const widthPercent = (daysInMonth / totalDays) * 100;
      
      positions.push({
        monthDate,
        startPercent,
        widthPercent,
        daysInMonth
      });
      
      cumulativeDays += daysInMonth;
    }
    
    return positions;
  };

  const monthHeaderPositions = getMonthHeaderPositions();
  const leftColumnWidth = 200; // Width of the left column in pixels

  return (
    <div className="w-full h-full flex flex-col">
      {/* Cost Chart */}
      {showChart && (
        <div className="mb-4 flex-1 min-h-0">
          <CostChart 
            bills={bills} 
            months={months} 
            startDate={startDate} 
            hoverMode={hoverMode}
            darkMode={darkMode}
            getBillingChunks={getBillingChunks}
            getMonthStartDate={getMonthStartDate}
            getTotalDays={getTotalDays}
          />
        </div>
      )}
      {/* Month headers with payment dates */}
      <div className={`sticky top-0 z-30 mb-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="relative" style={{ minHeight: '40px' }}>
          {/* Left column spacer for header */}
          <div 
            className={`absolute left-0 top-0 bottom-0 border-r ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            }`}
            style={{ width: `${leftColumnWidth}px` }}
          ></div>
          
          {/* Timeline header area */}
          <div className="absolute inset-0" style={{ left: `${leftColumnWidth}px`, right: '0' }}>
            {monthHeaderPositions.map((monthInfo, i) => {
              const monthName = monthInfo.monthDate.toLocaleString('default', { month: 'short' });
              const year = monthInfo.monthDate.getFullYear();
              
              return (
                <div 
                  key={i} 
                  className="absolute top-0 bottom-0"
                  style={{ 
                    left: `${monthInfo.startPercent}%`,
                    width: `${monthInfo.widthPercent}%`,
                    borderRight: i < months - 1 ? `1px solid ${darkMode ? '#374151' : '#e5e7eb'}` : 'none'
                  }}
                >
                  <div className={`font-semibold text-center py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {monthName} {year}
                  </div>
                </div>
              );
            })}
            
            {/* Payment date markers - positioned absolutely across entire timeline */}
            {paymentDates.flatMap((day) => {
              const markers = [];
              for (let i = 0; i < months; i++) {
                const monthDate = getMonthStartDate(i);
                const daysInMonth = getDaysInMonth(monthDate);
                
                if (day > daysInMonth) continue;
                
                // Calculate position relative to first month
                const paymentDate = new Date(monthDate);
                paymentDate.setDate(day);
                paymentDate.setHours(0, 0, 0, 0);
                
                const daysFromFirstMonth = getDatePosition(paymentDate, firstMonth);
                const positionPercent = (daysFromFirstMonth / totalDays) * 100;
                
                markers.push(
                  <div
                    key={`payment-marker-${i}-${day}`}
                    className="absolute top-0 bottom-0 flex flex-col items-center z-20"
                    style={{ 
                      left: `${positionPercent}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div 
                      className={`w-0.5 h-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                      style={{ opacity: 0.3 }}
                    />
                    <div 
                      className={`absolute top-8 text-xs whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {day}
                    </div>
                  </div>
                );
              }
              return markers;
            })}
          </div>
        </div>
      </div>

      {/* Bill rows */}
      <div 
        className="relative flex-shrink-0" 
        style={{ minHeight: `${bills.length * 60}px` }}
        onMouseMove={(e) => {
          const timelineContainer = e.currentTarget;
          const rect = timelineContainer.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const containerWidth = rect.width;
          const timelineWidth = containerWidth - leftColumnWidth;
          
          // Only calculate if mouse is over the timeline area (not the left column)
          if (mouseX >= leftColumnWidth && mouseX <= containerWidth) {
            const x = mouseX - leftColumnWidth;
            const timelinePercent = (x / timelineWidth) * 100;
            
            // Calculate the date at this position
            const hoverDate = new Date(firstMonth);
            const daysFromStart = (timelinePercent / 100) * totalDays;
            hoverDate.setDate(hoverDate.getDate() + Math.floor(daysFromStart));
            
            // Calculate cumulative cost based on hover mode
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let total = 0;
            
            if (hoverMode === 'current') {
              // Current mode: Sequential linear segments between bill due dates
              const daysUntilHover = (hoverDate - today) / (1000 * 60 * 60 * 24);
              
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
                  
                  if (daysUntilHover >= bill.daysUntilDue) {
                    // This bill is already due - count it fully
                    cumulativePaid += bill.amount;
                    prevDueDate = bill.daysUntilDue;
                  } else {
                    // We're in the interval before this bill is due
                    // Calculate slope: amount / (days until due - previous due date)
                    const intervalDays = bill.daysUntilDue - prevDueDate;
                    if (intervalDays > 0) {
                      const slope = bill.amount / intervalDays;
                      const daysInInterval = daysUntilHover - prevDueDate;
                      total = cumulativePaid + (slope * daysInInterval);
                    } else {
                      total = cumulativePaid;
                    }
                    break;
                  }
                }
                
                // If we've passed all bills, just sum them all
                if (daysUntilHover >= allBills[allBills.length - 1].daysUntilDue) {
                  total = allBills.reduce((sum, bill) => sum + bill.amount, 0);
                }
              }
            } else if (hoverMode === 'future') {
              // Future only: Count only from today forward
              bills.forEach(bill => {
                if (!bill.active) return;
                
                const billChunks = getBillingChunks(bill);
                billChunks.forEach(chunk => {
                  const chunkStart = chunk.start > today ? chunk.start : today;
                  const chunkEnd = chunk.end < hoverDate ? chunk.end : hoverDate;
                  
                  if (chunkStart < chunkEnd && chunkStart < hoverDate && chunkEnd > today) {
                    const chunkDays = (chunk.end - chunk.start) / (1000 * 60 * 60 * 24);
                    const includedDays = (chunkEnd - chunkStart) / (1000 * 60 * 60 * 24);
                    if (chunkDays > 0) {
                      const proportion = includedDays / chunkDays;
                      total += (chunk.amount || bill.amount) * proportion;
                    }
                  }
                });
              });
            } else {
              // Include past: Count from current cycle start
              bills.forEach(bill => {
                if (!bill.active) return;
                
                // Find the current billing cycle start
                const currentPaymentDate = new Date(today);
                currentPaymentDate.setDate(bill.paymentDate);
                currentPaymentDate.setHours(0, 0, 0, 0);
                
                if (currentPaymentDate > today) {
                  currentPaymentDate.setMonth(currentPaymentDate.getMonth() - 1);
                  currentPaymentDate.setDate(bill.paymentDate);
                }
                
                const calculationStart = new Date(currentPaymentDate);
                
                const billChunks = getBillingChunks(bill);
                billChunks.forEach(chunk => {
                  const chunkStart = chunk.start > calculationStart ? chunk.start : calculationStart;
                  const chunkEnd = chunk.end < hoverDate ? chunk.end : hoverDate;
                  
                  if (chunkStart < chunkEnd && chunkStart < hoverDate && chunkEnd > calculationStart) {
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
            
            // Position as percentage of entire container width
            const containerPercent = (mouseX / containerWidth) * 100;
            
            setHoverPosition(containerPercent);
            setCumulativeCost(total);
          } else {
            setHoverPosition(null);
            setCumulativeCost(0);
          }
        }}
        onMouseLeave={() => {
          setHoverPosition(null);
          setCumulativeCost(0);
        }}
      >
        {/* Hover indicator line and cost */}
        {hoverPosition !== null && (
          <div
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{
              left: `${hoverPosition}%`,
              width: '2px',
              transform: 'translateX(-50%)',
              background: darkMode 
                ? 'rgba(59, 130, 246, 0.4)' 
                : 'rgba(59, 130, 246, 0.5)',
              boxShadow: darkMode
                ? '0 0 8px rgba(59, 130, 246, 0.3)'
                : '0 0 8px rgba(59, 130, 246, 0.4)'
            }}
          >
            <div 
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                darkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-500 text-white'
              }`}
              style={{ marginTop: '-30px' }}
            >
              ${cumulativeCost.toFixed(2)}
            </div>
          </div>
        )}
        
        {/* Month boundary separators - lighter and thicker than payment date markers */}
        {monthBoundaries.slice(1, -1).map((boundary, idx) => (
          <div
            key={idx}
            className="absolute top-0 bottom-0 z-10"
            style={{
              left: `calc(${leftColumnWidth}px + ${boundary.position}% - 1px)`,
              width: '2px',
              background: darkMode 
                ? 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)'
                : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08), transparent)',
              pointerEvents: 'none'
            }}
          />
        ))}
        
        {bills.map((bill) => {
          const chunks = getBillingChunks(bill);
          
          // Calculate payment date positions for this bill (in days from first month)
          const getPaymentDateDays = () => {
            const positions = [];
            for (let i = 0; i < months; i++) {
              const monthDate = getMonthStartDate(i);
              const daysInMonth = getDaysInMonth(monthDate);
              
              if (bill.paymentDate <= daysInMonth) {
                const paymentDate = new Date(monthDate);
                paymentDate.setDate(bill.paymentDate);
                paymentDate.setHours(0, 0, 0, 0);
                
                const daysFromFirstMonth = getDatePosition(paymentDate, firstMonth);
                positions.push(daysFromFirstMonth);
              }
            }
            return positions;
          };
          
          const paymentDateDays = getPaymentDateDays();
          const gapSizePercent = 0.15; // Gap size as percentage of timeline
          
          // Helper to check if a date aligns with a payment date (within 0.5 days)
          const isPaymentDate = (days) => {
            return paymentDateDays.some(paymentDay => Math.abs(days - paymentDay) < 0.5);
          };
          
          return (
            <div 
              key={bill.id} 
              className={`relative border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ minHeight: '60px' }}
            >
              {/* Payment date vertical lines for this bill */}
              <div className="absolute inset-0" style={{ left: `${leftColumnWidth}px`, right: '0' }}>
                {paymentDateDays.map((paymentDay, idx) => {
                  const positionPercent = (paymentDay / totalDays) * 100;
                  // Only show if it's within the visible timeline
                  if (positionPercent >= 0 && positionPercent <= 100) {
                    return (
                      <div
                        key={`payment-line-${bill.id}-${idx}`}
                        className="absolute top-0 bottom-0 w-px z-15"
                        style={{
                          left: `${positionPercent}%`,
                          background: darkMode 
                            ? 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)'
                            : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15), transparent)',
                          pointerEvents: 'none'
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
              
              {/* Bill chunks with spacing at payment dates */}
              <div className="absolute inset-0" style={{ left: `${leftColumnWidth}px`, right: '0' }}>
                {chunks.map((chunk, chunkIndex) => {
                  // Calculate position in days from first month
                  const startDays = getDatePosition(chunk.start, firstMonth);
                  const endDays = getDatePosition(chunk.end, firstMonth);
                  const chunkDays = endDays - startDays;
                  
                  // Skip if chunk has no width
                  if (chunkDays <= 0) {
                    return null;
                  }
                  
                  let leftPercent = (startDays / totalDays) * 100;
                  let widthPercent = (chunkDays / totalDays) * 100;
                  
                  // Adjust for gaps: if chunk ends at a payment date, shorten it
                  // If chunk starts at a payment date (and it's not the first remainder), start after gap
                  const endsAtPaymentDate = isPaymentDate(endDays);
                  const startsAtPaymentDate = isPaymentDate(startDays) && !(chunk.isRemainder && chunk.isFirstChunk);
                  
                  if (endsAtPaymentDate && chunkIndex < chunks.length - 1) {
                    // Shorten chunk to create gap before next chunk
                    widthPercent -= gapSizePercent;
                  }
                  
                  if (startsAtPaymentDate && chunkIndex > 0) {
                    // Start chunk after gap
                    leftPercent += gapSizePercent;
                    widthPercent -= gapSizePercent;
                  }
                  
                  // Clamp values
                  leftPercent = Math.max(0, Math.min(100, leftPercent));
                  widthPercent = Math.max(0.01, Math.min(100 - leftPercent, widthPercent));
                  
                  // For the first remainder chunk, don't round left corners
                  // For the last chunk, don't round right corners
                  const isFirstRemainder = chunk.isRemainder && chunk.isFirstChunk;
                  const isLastChunk = chunkIndex === chunks.length - 1;
                  let borderRadius = '0.5rem'; // Default: round all corners
                  
                  if (isFirstRemainder && isLastChunk) {
                    borderRadius = '0'; // No rounding if it's both first and last
                  } else if (isFirstRemainder) {
                    borderRadius = '0 0.5rem 0.5rem 0'; // Only round right corners
                  } else if (isLastChunk) {
                    borderRadius = '0.5rem 0 0 0.5rem'; // Only round left corners
                  }
                  
                  return (
                    <div
                      key={chunkIndex}
                      className="absolute top-2 h-10 flex items-center justify-center text-white text-xs font-medium"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        borderRadius: borderRadius,
                        background: createGradient(bill.color, chunk.isActive),
                        opacity: chunk.isActive ? 1 : 0.3,
                        boxShadow: chunk.isActive 
                          ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)'
                          : '0 1px 3px rgba(0, 0, 0, 0.2)',
                        zIndex: 1,
                        border: chunk.isActive 
                          ? chunk.isAfterFutureAmount 
                            ? '2px solid rgba(239, 68, 68, 0.8)' // Red border for future amount
                            : '1px solid rgba(255, 255, 255, 0.1)'
                          : 'none'
                      }}
                      title={`${bill.name} - $${bill.amount} - ${chunk.isActive ? 'Active' : 'Deactivated'}`}
                    >
                      <span className="truncate px-2 font-medium">
                        {bill.name} <span className="opacity-90">${chunk.amount || bill.amount}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Left column with bill info and controls */}
              <div 
                className={`absolute left-0 top-0 h-full flex items-center gap-2 px-3 border-r z-20 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-300'
                }`}
                style={{ width: `${leftColumnWidth}px` }}
              >
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {bill.name}
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ${bill.amount}
                    {bill.futureAmount && bill.futureAmountDate && (
                      <span className="ml-1 text-orange-500">
                        → ${bill.futureAmount}
                      </span>
                    )}
                  </div>
                  {!bill.active && (() => {
                    // Calculate remaining time until service ends
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const currentPaymentDate = new Date(today);
                    currentPaymentDate.setDate(bill.paymentDate);
                    currentPaymentDate.setHours(0, 0, 0, 0);
                    if (currentPaymentDate > today) {
                      currentPaymentDate.setMonth(currentPaymentDate.getMonth() - 1);
                      currentPaymentDate.setDate(bill.paymentDate);
                    }
                    const currentCycleEnd = new Date(currentPaymentDate);
                    currentCycleEnd.setMonth(currentCycleEnd.getMonth() + 1);
                    currentCycleEnd.setDate(bill.paymentDate);
                    const daysRemaining = Math.ceil((currentCycleEnd - today) / (1000 * 60 * 60 * 24));
                    
                    if (daysRemaining > 0 && today >= currentPaymentDate && today < currentCycleEnd) {
                      return (
                        <div className={`text-xs mt-0.5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                          Ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="relative flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === bill.id ? null : bill.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      darkMode
                        ? 'hover:bg-gray-700 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Options"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5" />
                  </button>
                  
                  {openDropdown === bill.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-50" 
                        onClick={() => setOpenDropdown(null)}
                      />
                      <div className={`absolute right-0 top-8 z-[60] min-w-[160px] rounded-md shadow-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onToggleActive(bill.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              bill.active
                                ? darkMode
                                  ? 'hover:bg-gray-600 text-gray-300'
                                  : 'hover:bg-gray-100 text-gray-700'
                                : darkMode
                                  ? 'hover:bg-gray-600 text-gray-300'
                                  : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {bill.active ? 'Turn Off' : 'Turn On'}
                          </button>
                          {onMoveBill && (
                            <>
                              <button
                                onClick={() => {
                                  onMoveBill(bill.id, 'up');
                                  setOpenDropdown(null);
                                }}
                                disabled={bills.findIndex(b => b.id === bill.id) === 0}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                  bills.findIndex(b => b.id === bill.id) === 0
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                } ${
                                  darkMode
                                    ? 'hover:bg-gray-600 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                Move Up
                              </button>
                              <button
                                onClick={() => {
                                  onMoveBill(bill.id, 'down');
                                  setOpenDropdown(null);
                                }}
                                disabled={bills.findIndex(b => b.id === bill.id) === bills.length - 1}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                  bills.findIndex(b => b.id === bill.id) === bills.length - 1
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                } ${
                                  darkMode
                                    ? 'hover:bg-gray-600 text-gray-300'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                Move Down
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (onUpdateBill) {
                                onUpdateBill(bill.id);
                              }
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              darkMode
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            Edit Future Amount
                          </button>
                          <button
                            onClick={() => {
                              onDelete(bill.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                              darkMode
                                ? 'hover:bg-gray-600 text-red-400'
                                : 'hover:bg-gray-100 text-red-600'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;

