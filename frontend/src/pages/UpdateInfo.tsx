import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import type { BulkUser } from './Dashboard';

const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.userId || null; 
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const UpdateInfo = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const loggedInUserId = getUserIdFromToken();

        if (!loggedInUserId) {
          setMessage({ type: 'error', text: 'Session expired or invalid token. Please log in again.' });
          return;
        }

        const response = await api.get('/user/bulk', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allUsers = Array.isArray(response.data) ? response.data : response.data.users || [];

        const currentUser = allUsers.find((user: BulkUser) => user.id === loggedInUserId);

        if (currentUser) {
          setFirstName(currentUser.firstName || '');
          setLastName(currentUser.lastName || '');
          setUsername(currentUser.username || ''); // Set the email block
        } else {
          setMessage({ type: 'error', text: 'Could not locate your user profile in the database directory.' });
        }
      } catch (error) {
        console.error("Error fetching user profile data:", error);
        setMessage({ type: 'error', text: 'Failed to load existing profile records.' });
      } finally {
        setFetching(false);
      }
    };

    fetchProfileDetails();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');

      await api.put('/user/', {
        firstName,
        lastName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Information updated successfully!' });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error("Error updating information:", error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Retrieving account settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-6">
        
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Update Profile Info</h2>
          <p className="text-xs text-gray-500 mt-1">Modify your personal details below.</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Email Address (Username)
            </label>
            <input
              type="text"
              value={username}
              disabled
              className="block w-full rounded-xl border border-gray-200 bg-gray-100 py-3 px-4 text-sm text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="block w-full rounded-xl border border-gray-300 bg-gray-50 py-3 px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving updates...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateInfo;