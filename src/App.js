import React, { useState, useEffect } from 'react';
import './App.css';
import Timeline from './components/Timeline';
import BillForm from './components/BillForm';
import FutureAmountForm from './components/FutureAmountForm';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const STORAGE_KEY = 'billsub-tracker-bills';
const THEME_KEY = 'billsub-tracker-theme';
const HOVER_MODE_KEY = 'billsub-tracker-hover-mode';

function App() {
  const [bills, setBills] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved ? saved === 'dark' : false;
  });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [openMainMenu, setOpenMainMenu] = useState(false);
  const [hoverMode, setHoverMode] = useState(() => {
    const saved = localStorage.getItem(HOVER_MODE_KEY);
    return saved || 'current'; // Default to 'current', options: 'current', 'future', 'include-past'
  });
  const [showChart, setShowChart] = useState(false);
  const months = 4;
  const startDate = new Date();

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Save hover mode preference
  useEffect(() => {
    localStorage.setItem(HOVER_MODE_KEY, hoverMode);
  }, [hoverMode]);

  // Load bills from localStorage on mount
  useEffect(() => {
    try {
      const savedBills = localStorage.getItem(STORAGE_KEY);
      if (savedBills) {
        const parsed = JSON.parse(savedBills);
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          // Ensure all bills have required fields
          const validatedBills = parsed.map(bill => ({
            ...bill,
            id: bill.id || Date.now().toString() + Math.random(),
            name: bill.name || '',
            amount: typeof bill.amount === 'number' ? bill.amount : parseFloat(bill.amount) || 0,
            paymentDate: typeof bill.paymentDate === 'number' ? bill.paymentDate : parseInt(bill.paymentDate) || 1,
            color: bill.color || '#3B82F6',
            active: bill.active !== undefined ? bill.active : true,
            futureAmount: bill.futureAmount || null,
            futureAmountDate: bill.futureAmountDate || null
          })).filter(bill => bill.name && bill.amount > 0); // Filter out invalid bills
          
          if (validatedBills.length > 0) {
            setBills(validatedBills);
          }
        }
      }
    } catch (e) {
      console.error('Error loading bills from localStorage:', e);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save bills to localStorage whenever bills change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
      } catch (e) {
        console.error('Error saving bills to localStorage:', e);
      }
    }
  }, [bills, isLoaded]);

  const handleAddBill = (bill) => {
    setBills([...bills, bill]);
    setShowAddPanel(false);
  };

  const handleToggleActive = (billId) => {
    setBills(bills.map(bill => 
      bill.id === billId 
        ? { ...bill, active: !bill.active }
        : bill
    ));
  };

  const handleDeleteBill = (billId) => {
    setBills(bills.filter(bill => bill.id !== billId));
  };

  const handleUpdateBill = (billId) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setEditingBill(bill);
    }
  };

  const handleSaveFutureAmount = (updatedBill) => {
    setBills(bills.map(bill => 
      bill.id === updatedBill.id ? updatedBill : bill
    ));
    setEditingBill(null);
  };

  const handleMoveBill = (billId, direction) => {
    const currentIndex = bills.findIndex(b => b.id === billId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= bills.length) return;
    
    const newBills = [...bills];
    [newBills[currentIndex], newBills[newIndex]] = [newBills[newIndex], newBills[currentIndex]];
    setBills(newBills);
  };

  return (
    <div className={`h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} overflow-hidden`}>
      <div className="h-full flex flex-col container mx-auto px-4 py-4 relative">
        {/* Overlay Panel for Add Form */}
        {showAddPanel && (
          <BillForm 
            onAdd={handleAddBill} 
            darkMode={darkMode}
            onClose={() => setShowAddPanel(false)}
          />
        )}
        
        {/* Future Amount Edit Form */}
        {editingBill && (
          <FutureAmountForm
            bill={editingBill}
            onSave={handleSaveFutureAmount}
            onClose={() => setEditingBill(null)}
            darkMode={darkMode}
          />
        )}
        
        <div className={`rounded-lg shadow-md p-4 transition-colors relative flex flex-col ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } ${showChart ? 'flex-1 overflow-hidden' : ''}`}>
          <Timeline 
            bills={bills} 
            months={months} 
            startDate={startDate} 
            darkMode={darkMode}
            onToggleActive={handleToggleActive}
            onDelete={handleDeleteBill}
            onUpdateBill={handleUpdateBill}
            onMoveBill={handleMoveBill}
            hoverMode={hoverMode}
            showChart={showChart}
          />
        </div>
      </div>
      
      {/* Bottom-right controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chart toggle button */}
        <button
          onClick={() => setShowChart(!showChart)}
          className={`p-2 rounded-full shadow-md text-sm transition-colors ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              : 'bg-white hover:bg-gray-100 text-gray-700'
          }`}
          title="Toggle Chart"
        >
          {showChart ? '☑📈' : '☐📈'}
        </button>

        {/* Main menu dropdown fixed to bottom right of viewport */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMainMenu(!openMainMenu);
          }}
          className={`p-3 rounded-full shadow-lg transition-colors ${
            darkMode
              ? 'hover:bg-gray-700 text-gray-300 bg-gray-800'
              : 'hover:bg-gray-100 text-gray-600 bg-white'
          }`}
          title="Options"
        >
          <EllipsisVerticalIcon className="w-6 h-6" />
        </button>
        
        {openMainMenu && (
          <>
            <div 
              className="fixed inset-0 z-50" 
              onClick={() => setOpenMainMenu(false)}
            />
            <div className={`absolute right-0 bottom-16 z-[60] min-w-[200px] rounded-md shadow-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowAddPanel(true);
                    setOpenMainMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-600 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  + Add Bill/Subscription
                </button>
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    setOpenMainMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    darkMode
                      ? 'hover:bg-gray-600 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                <div className={`border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                <div className={`px-4 py-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Hover Mode:
                </div>
                <button
                  onClick={() => {
                    setHoverMode('current');
                    setOpenMainMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    hoverMode === 'current'
                      ? darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'
                      : darkMode
                        ? 'hover:bg-gray-600 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {hoverMode === 'current' ? '✓ ' : ''}💰 Current (Accrual)
                </button>
                <button
                  onClick={() => {
                    setHoverMode('future');
                    setOpenMainMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    hoverMode === 'future'
                      ? darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'
                      : darkMode
                        ? 'hover:bg-gray-600 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {hoverMode === 'future' ? '✓ ' : ''}📅 Future Only
                </button>
                <button
                  onClick={() => {
                    setHoverMode('include-past');
                    setOpenMainMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    hoverMode === 'include-past'
                      ? darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'
                      : darkMode
                        ? 'hover:bg-gray-600 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {hoverMode === 'include-past' ? '✓ ' : ''}📊 Include Past
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
