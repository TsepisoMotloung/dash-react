import React, { useState } from 'react';
import { Lock, UserCheck, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleSubmit = () => {
    // Mock user validation - replace with actual dataUtils call
    const mockUsers = {
      supervisor1: { username: 'supervisor1', password: 'admin123', role: 'supervisor', code: 'SUP001' },
      broker1: { username: 'broker1', password: 'pass123', role: 'broker', code: 'BRK001' },
      agent1: { username: 'agent1', password: 'pass123', role: 'agent', code: 'AGT001' }
    };
    
    const user = mockUsers[loginForm.username];
    if (user && user.password === loginForm.password) {
      onLogin(user);
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Geometric Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 opacity-10 rounded-full blur-3xl -ml-48 -mt-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400 opacity-10 rounded-full blur-3xl -mr-48 -mb-48"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 border-4 border-white opacity-5 rounded-full"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 border-4 border-yellow-300 opacity-10 rotate-45"></div>
      
      {/* Floating Circles */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-400 opacity-20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-12 h-12 bg-cyan-400 opacity-20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-10 w-8 h-8 bg-pink-400 opacity-20 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>

      {/* Main Login Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Decorative Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
          {/* Geometric decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 border-4 border-white opacity-10 rotate-45 -ml-12 -mb-12"></div>
          <div className="absolute top-1/2 right-8 w-16 h-16 bg-yellow-400 opacity-20 rounded-lg rotate-12"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl mb-4 border-2 border-white border-opacity-30">
              <TrendingUp className="w-10 h-10 text-yellow-300" />
            </div>
            <h2 className="text-3xl font-bold mb-2">AIC BI</h2>
            <p className="text-blue-100">Sign in to access your analytics</p>
            
            {/* Decorative dots */}
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-cyan-300 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
              <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter username"
                />
                <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {/* Demo Credentials Box */}
          <div className="mt-6 relative">
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-blue-300 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-300 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-300 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-pink-300 rounded-br-lg"></div>
            
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <p className="text-sm font-bold text-gray-800">Demo Credentials</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-gray-700"><span className="font-semibold">Supervisors:</span> supervisor1 / admin123</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-xs text-gray-700"><span className="font-semibold">Brokers:</span> broker1 / pass123</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="text-xs text-gray-700"><span className="font-semibold">Agents:</span> agent1 / pass123</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
      </div>
    </div>
  );
};

export default LoginForm;