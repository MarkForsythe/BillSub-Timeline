import React, { useState, useEffect } from 'react';

const FutureAmountForm = ({ bill, onSave, onClose, darkMode }) => {
  const [futureAmount, setFutureAmount] = useState(bill.futureAmount?.toString() || '');
  const [futureAmountDate, setFutureAmountDate] = useState(
    bill.futureAmountDate ? new Date(bill.futureAmountDate).toISOString().split('T')[0] : ''
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (futureAmount && futureAmountDate) {
      onSave({
        ...bill,
        futureAmount: parseFloat(futureAmount),
        futureAmountDate: new Date(futureAmountDate).toISOString()
      });
    } else {
      // Clear future amount if fields are empty
      onSave({
        ...bill,
        futureAmount: null,
        futureAmountDate: null
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 p-4`}>
        <div 
          className={`rounded-lg shadow-xl max-w-md w-full ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Future Amount - {bill.name}
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-md transition-colors ${
                  darkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Amount
                  </label>
                  <div className={`px-3 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    ${bill.amount}
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Future Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={futureAmount}
                    onChange={(e) => setFutureAmount(e.target.value)}
                    placeholder="10.00"
                    className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 text-white border border-gray-600' 
                        : 'border border-gray-300'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Leave empty to remove future amount
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Change Date
                  </label>
                  <input
                    type="date"
                    value={futureAmountDate}
                    onChange={(e) => setFutureAmountDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 text-white border border-gray-600' 
                        : 'border border-gray-300'
                    }`}
                    disabled={!futureAmount}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FutureAmountForm;

