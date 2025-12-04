import React, { useState } from 'react';

const BillForm = ({ onAdd, darkMode, onClose }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && amount && paymentDate) {
      onAdd({
        name,
        amount: parseFloat(amount),
        paymentDate: parseInt(paymentDate),
        color,
        active: true,
        id: Date.now().toString()
      });
      setName('');
      setAmount('');
      setPaymentDate('');
      setColor('#3B82F6');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 left-0 w-96 h-full shadow-2xl z-50 transform transition-transform duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add Bill/Subscription
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
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="AT&T"
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-white border border-gray-600' 
                      : 'border border-gray-300'
                  }`}
                  required
                  autoFocus
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="23.40"
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-white border border-gray-600' 
                      : 'border border-gray-300'
                  }`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Payment Date
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  placeholder="21"
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 text-white border border-gray-600' 
                      : 'border border-gray-300'
                  }`}
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className={`flex-1 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 text-white border border-gray-600' 
                        : 'border border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
              >
                Add Bill/Subscription
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
    </>
  );
};

export default BillForm;
