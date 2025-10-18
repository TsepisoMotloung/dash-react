import React, { useState, useEffect } from 'react';
import {dataUtils} from '../utils/dataUtils';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

// ============= LOGIN COMPONENT =============
const LoginForm = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleSubmit = () => {
    const user = dataUtils.users[loginForm.username];
    if (user && user.password === loginForm.password) {
      onLogin(user);
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Sales Dashboard</h2>
          <p className="text-gray-600 mt-2">Sign in to access your analytics</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600">Supervisors: supervisor1 / admin123</p>
          <p className="text-xs text-gray-600">Brokers: broker1 / pass123</p>
          <p className="text-xs text-gray-600">Agents: agent1 / pass123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;