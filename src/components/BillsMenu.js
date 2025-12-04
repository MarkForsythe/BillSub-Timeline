import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/outline';

const BillsMenu = ({ bills, onToggleActive, onDelete, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-lg shadow-md mb-4 transition-colors ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left font-semibold rounded-lg transition-colors ${
          darkMode
            ? 'text-gray-200 hover:bg-gray-700'
            : 'text-gray-800 hover:bg-gray-50'
        }`}
      >
        <span>Bills & Subscriptions ({bills.length})</span>
        {isOpen ? (
          <ChevronUpIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        ) : (
          <ChevronDownIcon className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        )}
      </button>
      
      {isOpen && (
        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {bills.length === 0 ? (
            <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No bills or subscriptions yet. Add one to get started!
            </div>
          ) : (
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: bill.color }}
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {bill.name}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        ${bill.amount} • Day {bill.paymentDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleActive(bill.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        bill.active
                          ? darkMode
                            ? 'bg-green-900 text-green-300 hover:bg-green-800'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          : darkMode
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {bill.active ? 'Active' : 'Deactivated'}
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className={`p-2 rounded-md transition-colors ${
                        darkMode
                          ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-30'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete bill"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillsMenu;
