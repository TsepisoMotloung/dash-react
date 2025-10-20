import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import {dataUtils} from '../utils/dataUtils';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';


// ============= STATS PANEL COMPONENT =============
const StatsPanel = ({ filteredData, userRole }) => {
  if (!filteredData || filteredData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Unique Products:</span>
            <span className="font-bold text-gray-800">{new Set(filteredData.map(row => row['Product Name'])).size}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Active Agents:</span>
            <span className="font-bold text-gray-800">{new Set(filteredData.map(row => row['Agent Code'])).size}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Regions Covered:</span>
            <span className="font-bold text-gray-800">{new Set(filteredData.map(row => row['Customer Region'])).size}</span>
          </div>
          {userRole === 'supervisor' && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Brokers:</span>
              <span className="font-bold text-gray-800">{new Set(filteredData.map(row => row['Broker Code'])).size}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Target Achievement</span>
              <span className="text-sm font-bold text-gray-800">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-sm font-bold text-gray-800">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Market Coverage</span>
              <span className="text-sm font-bold text-gray-800">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '65%'}}></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Insights</h3>
        <div className="space-y-3 text-sm text-gray-700">
          {(() => {
            const insights = [];
            // Highest revenue region
            const regionRevenue = {};
            filteredData.forEach(row => {
              regionRevenue[row['Customer Region']] = (regionRevenue[row['Customer Region']] || 0) + (row['Total Revenue'] || 0);
            });
            const topRegion = Object.entries(regionRevenue).sort((a,b) => b[1] - a[1])[0];
            if (topRegion) insights.push(`Top region: ${topRegion[0]} with ${topRegion[1].toLocaleString()}`);

            // Busiest month by transactions
            const monthCounts = {};
            filteredData.forEach(row => {
              const m = row.Date.toLocaleString(undefined, { month: 'short', year: 'numeric' });
              monthCounts[m] = (monthCounts[m] || 0) + 1;
            });
            const topMonth = Object.entries(monthCounts).sort((a,b) => b[1] - a[1])[0];
            if (topMonth) insights.push(`Busiest month: ${topMonth[0]} with ${topMonth[1]} transactions`);

            // Average order value
            const totalRev = filteredData.reduce((s, r) => s + (r['Total Revenue'] || 0), 0);
            const avgOrder = filteredData.length > 0 ? totalRev / filteredData.length : 0;
            insights.push(`Average order value: ${avgOrder.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}`);

            // Top product quick stat
            const productRevenue = {};
            filteredData.forEach(row => {
              productRevenue[row['Product Name']] = (productRevenue[row['Product Name']] || 0) + (row['Total Revenue'] || 0);
            });
            const topProduct = Object.entries(productRevenue).sort((a,b) => b[1] - a[1])[0];
            if (topProduct) insights.push(`Top product: ${topProduct[0]} (${topProduct[1].toLocaleString()})`);

            return insights.map((ins, i) => <div key={i}>• {ins}</div>);
          })()}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Access Level</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${userRole === 'supervisor' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Full Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${userRole === 'broker' || userRole === 'supervisor' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Team Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Personal Data</span>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Your Access:</strong> {
                userRole === 'supervisor' ? 'All company data and analytics' :
                userRole === 'broker' ? 'Your team\'s performance data' :
                'Your individual sales data'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;