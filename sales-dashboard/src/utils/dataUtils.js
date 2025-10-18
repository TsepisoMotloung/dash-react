import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

// ============= DATA UTILITIES =============
export const dataUtils = {
  users: {
    'supervisor1': { password: 'admin123', role: 'supervisor', code: 'SUP001' },
    'supervisor2': { password: 'admin123', role: 'supervisor', code: 'SUP002' },
    'broker1': { password: 'pass123', role: 'broker', code: 'BRK001' },
    'broker2': { password: 'pass123', role: 'broker', code: 'BRK002' },
    'broker3': { password: 'pass123', role: 'broker', code: 'BRK003' },
    'broker4': { password: 'pass123', role: 'broker', code: 'BRK004' },
    'agent1': { password: 'pass123', role: 'agent', code: 'AGT001' },
    'agent2': { password: 'pass123', role: 'agent', code: 'AGT002' },
    'agent3': { password: 'pass123', role: 'agent', code: 'AGT003' },
    'agent4': { password: 'pass123', role: 'agent', code: 'AGT004' },
    'agent5': { password: 'pass123', role: 'agent', code: 'AGT005' },
    'agent6': { password: 'pass123', role: 'agent', code: 'AGT006' },
    'agent7': { password: 'pass123', role: 'agent', code: 'AGT007' },
    'agent8': { password: 'pass123', role: 'agent', code: 'AGT008' },
    'agent9': { password: 'pass123', role: 'agent', code: 'AGT009' },
    'agent10': { password: 'pass123', role: 'agent', code: 'AGT010' }
  },

  // Load data from Excel file in public folder
  loadDataFromExcel: async () => {
    try {
      const response = await fetch('/data.xlsx');
      if (!response.ok) {
        throw new Error('Failed to fetch Excel file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true  // Ensure dates are parsed as Date objects
      });
      
      // Assuming data is in the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        dateNF: 'yyyy-mm-dd'
      });
      
      // Parse dates and ensure proper data types
      const parsedData = jsonData.map(row => {
        let dateValue;
        
        // Handle different date formats from Excel
        if (row.Date) {
          if (row.Date instanceof Date) {
            dateValue = row.Date;
          } else if (typeof row.Date === 'number') {
            // Excel serial date number - convert to proper date
            const excelEpoch = new Date(1899, 11, 30);
            dateValue = new Date(excelEpoch.getTime() + row.Date * 86400000);
          } else if (typeof row.Date === 'string') {
            dateValue = new Date(row.Date);
          } else {
            dateValue = new Date();
          }
        } else {
          dateValue = new Date();
        }
        
        // Validate the date
        if (isNaN(dateValue.getTime())) {
          dateValue = new Date();
        }
        
        return {
          Date: dateValue,
          'Total Revenue': parseFloat(row['Total Revenue']) || 0,
          'Agent Code': row['Agent Code'] || '',
          'Broker Code': row['Broker Code'] || '',
          'Product Name': row['Product Name'] || '',
          'Customer Region': row['Customer Region'] || '',
          'Sales Volume': parseFloat(row['Sales Volume']) || 0
        };
      });
      
      // Sort by date to ensure chronological order
      parsedData.sort((a, b) => a.Date - b.Date);
      
      return parsedData;
    } catch (error) {
      console.error('Error loading Excel file:', error);
      // Return empty array if file can't be loaded
      return [];
    }
  },

  formatCurrency: (value) => {
    if (value >= 1000000) return `M${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `M${(value / 1000).toFixed(1)}K`;
    return `M${value.toFixed(0)}`;
  },

  getGrowthColor: (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  },

  getGrowthIcon: (value) => {
    if (value > 0) return '↗';
    if (value < 0) return '↘';
    return '→';
  },

  getGrowthBgColor: (value) => {
    if (value > 0) return 'bg-green-50 border-green-200';
    if (value < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  }
};