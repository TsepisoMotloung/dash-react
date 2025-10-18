import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import {dataUtils} from '../utils/dataUtils';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';


// ============= HEADER COMPONENT =============
const DashboardHeader = ({ userRole, userCode, onLogout, onExport }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Sales Analytics Dashboard</h1>
          <p className="text-gray-600">Interactive visualization of sales performance and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-800">{userRole.toUpperCase()}</span>
            </div>
            <p className="text-sm text-gray-600">Code: {userCode}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button
                  onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg transition-all"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { onExport('json'); setShowExportMenu(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg transition-all"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;