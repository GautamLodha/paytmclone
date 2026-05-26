import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Send = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const receiver = location.state?.receiver as {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  } | null;

  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!receiver) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <p className="text-red-500 font-medium mb-4">No receiver selected.</p>
          <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await api.post(
        '/account/transfer', 
        {
          to: receiver.id, 
          amount: transferAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus({ type: 'success', message: response.data.message || 'Transfer successful!' });
      setAmount(''); // Clear input
      
      setTimeout(() => navigate('/dashboard'), 2000);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Transaction failed. Please try again.';
      setStatus({ type: 'error', message: errorMsg });
  
      console.log("Full error object from Axios:", error);
      
      const backendError = error.response?.data?.message || 'Transaction failed. Server unreachable.';
      setErrorMessage(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Send Money</h2>
        </div>

        {/* Receiver Card Info */}
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white text-lg shadow-sm">
            {receiver.firstName[0]?.toUpperCase()}{receiver.lastName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{receiver.firstName} {receiver.lastName}</p>
            <p className="text-xs text-gray-500">{receiver.username}</p>
          </div>
        </div>

        {/* Transaction Form */}
        <form onSubmit={handleTransfer} className="space-y-5">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (in ₹)
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                ₹
              </div>
              <input
                id="amount"
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="block w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-gray-900 font-medium placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Alert Callouts */}
          {status && (
            <div className={`p-3 rounded-lg text-sm font-medium text-center ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.message}
            </div>
          )}
          {errorMessage && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100 animate-fade-in">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Render Success Alert if transaction goes through */}
          {successMessage && (
            <div className="flex items-center space-x-2 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-100">
              <span>✅</span>
              <p>{successMessage}</p>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors duration-150 disabled:bg-indigo-400 shadow-md shadow-indigo-100"
            >
              {loading ? 'Processing...' : `Initiate Transfer`}
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default Send;