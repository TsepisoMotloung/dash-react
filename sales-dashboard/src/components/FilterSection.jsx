import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import {dataUtils} from '../utils/dataUtils';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';


// ============= FILTER SECTION COMPONENT =============
const FilterSection = ({ filters, setFilters, userRole, userCode, data, showFilters, setShowFilters }) => {
  const getUniqueValues = (field) => {
    if (!data) return [];
    return [...new Set(data.map(row => row[field]))].filter(Boolean).sort();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4"
      >
        <Filter className="w-5 h-5" />
        Filters {showFilters ? '▼' : '▶'}
      </button>
      
      {showFilters && (
        <div>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Available Filters for {userRole.toUpperCase()}:</strong>{' '}
              {userRole === 'supervisor' && 'All filters including Broker Code, Agent Code, Region, Product, and Date Range'}
              {userRole === 'broker' && 'Agent Code, Region, Product, and Date Range (Your broker code is automatically applied)'}
              {userRole === 'agent' && 'Region, Product, and Date Range (Your agent code is automatically applied)'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {userRole === 'supervisor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Broker Code</label>
                <select
                  value={filters.brokerCode}
                  onChange={(e) => setFilters({...filters, brokerCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brokers</option>
                  {getUniqueValues('Broker Code').map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(userRole === 'supervisor' || userRole === 'broker') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Code</label>
                <select
                  value={filters.agentCode}
                  onChange={(e) => setFilters({...filters, agentCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Agents</option>
                  {getUniqueValues('Agent Code')
                    .filter(code => {
                      if (userRole === 'supervisor') return true;
                      const agentsInTeam = data ? data.filter(row => row['Broker Code'] === userCode) : [];
                      return agentsInTeam.some(row => row['Agent Code'] === code);
                    })
                    .map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Region</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({...filters, region: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Regions</option>
                {getUniqueValues('Customer Region').map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <select
                value={filters.productName}
                onChange={(e) => setFilters({...filters, productName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {getUniqueValues('Product Name').map(product => (
                  <option key={product} value={product}>{product}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Frame</label>
              <select
                value={filters.timeFrame}
                onChange={(e) => setFilters({...filters, timeFrame: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comparison</label>
              <select
                value={filters.comparisonType}
                onChange={(e) => setFilters({...filters, comparisonType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="mom">M-O-M</option>
                <option value="yoy">Y-O-Y</option>
                <option value="qtq">Q-T-Q</option>
                <option value="ytd">YTD</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setFilters({
                agentCode: '',
                brokerCode: '',
                region: '',
                productName: '',
                dateFrom: '',
                dateTo: '',
                timeFrame: 'monthly',
                comparisonType: 'mom'
              })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;