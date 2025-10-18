import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';
import {dataUtils} from '../utils/dataUtils';


// ============= CHART TABS COMPONENT =============
const ChartTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'monthly', label: 'Monthly Growth', icon: '📈' },
    { id: 'products', label: 'Top Products', icon: '🏆' },
    { id: 'seasonal', label: 'Seasonal Trends', icon: '🌟' },
    { id: 'regional', label: 'Regional Performance', icon: '🌍' },
    { id: 'agents', label: 'Agent Performance', icon: '👥' },
    { id: 'forecast', label: 'Revenue Forecast', icon: '🔮' },
    { id: 'comparison', label: 'Comparative Analysis', icon: '📋' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-2">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartTabs;