import React, { useState } from 'react';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

const DashboardHeader = ({ userRole, userCode, onLogout, onExport }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-6 overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      <div className="absolute top-1/2 right-1/4 w-32 h-32 border-4 border-white opacity-10 rotate-45 transform -translate-y-1/2"></div>
      <div className="absolute bottom-8 right-12 w-16 h-16 bg-yellow-400 opacity-20 rounded-lg rotate-12"></div>
      <div className="absolute top-12 left-1/3 w-24 h-24 border-4 border-cyan-300 opacity-15 rounded-full"></div>
      
      {/* Accent Bars */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 to-orange-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>

      <div className="relative z-10 flex justify-between items-center flex-wrap gap-6">
        <div className="flex-1 min-w-64">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-yellow-300" />
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">BI Dashboards</h1>
          </div>
          <p className="text-blue-100 text-lg ml-1">Interactive visualization of Business Intelligence Dashboards</p>
        </div>

        <div className="flex items-center gap-4">
          {/* User Info Card */}
          <div className="bg-white bg-opacity-15 backdrop-blur-md rounded-xl p-4 border border-white border-opacity-20 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-cyan-400 p-2 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-900" />
              </div>
              <span className="font-bold text-xl text-white tracking-wide">{userRole.toUpperCase()}</span>
            </div>
            <p className="text-sm text-blue-100 ml-1">Code: <span className="font-semibold text-cyan-200">{userCode}</span></p>
          </div>

          {/* Export Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                <button
                  onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                  className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all font-medium text-gray-700 hover:text-green-700 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Export as CSV
                </button>
                <div className="h-px bg-gray-100"></div>
                <button
                  onClick={() => { onExport('json'); setShowExportMenu(false); }}
                  className="w-full text-left px-5 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all font-medium text-gray-700 hover:text-green-700 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Export as JSON
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-opacity-30 transition-all border border-white border-opacity-30 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Bottom Decorative Elements */}
      <div className="absolute bottom-0 right-0 flex gap-2 mr-8 mb-2 opacity-10">
        <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
        <div className="w-3 h-3 bg-cyan-300 rounded-full"></div>
        <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default DashboardHeader;