import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config/config';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get email from location state or query param
  const email = location.state?.email || '';
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/verify`, { email, code });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <p className="mb-4">A 4-digit code was sent to <b>{email}</b>. Please enter it below:</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          maxLength={4}
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Enter 4-digit code"
          required
        />
        <button
          type="submit"
          className="w-full bg-primary-accent text-white py-2 rounded font-semibold"
        >
          Verify
        </button>
      </form>
      {message && <div className="bg-green-100 text-green-700 px-4 py-2 mt-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 mt-4 rounded">{error}</div>}
    </div>
  );
};

export default VerifyEmailPage; 
