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