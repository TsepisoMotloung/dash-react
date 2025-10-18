// Revised SalesDashboard.js - Main Component

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import { dataUtils } from './utils/dataUtils';
import { calculationUtils } from './utils/ calculationUtils';
import { chartUtils } from './utils/chartUtils';
import { ChartTabs, FilterSection, DashboardHeader, LoginForm, MetricsCards, StatsPanel } from './components';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [filters, setFilters] = useState({
    agentCode: '',
    brokerCode: '',
    region: '',
    productName: '',
    dateFrom: '',
    dateTo: '',
    timeFrame: 'monthly',
    comparisonType: 'mom'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


    

  async function getSalesData() {
    try {
      const salesData = await dataUtils.loadDataFromExcel();
      if(salesData.length === 0) {
        console.log('No data loaded from Excel file.');
      }else {
        return salesData;
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      return [];
    } 
  } 

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const sampleData = await getSalesData(); // Add await here
      console.log(sampleData);
      setData(sampleData);
      setIsLoading(false);
    };
    
    loadData(); // Call the async function
  }, []);

  

  useEffect(() => {
    if (data) {
      applyFilters();
    }
  }, [data, filters, userRole, userCode]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      const metrics = calculationUtils.calculateComparisonMetrics(
        filteredData,
        data,
        filters,
        userRole,
        userCode
      );
      setComparisonMetrics(metrics);
    }
  }, [filteredData, filters.comparisonType]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      renderChart();
    }
  }, [activeTab, filteredData, filters.timeFrame, comparisonMetrics]);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUserRole(user.role);
    setUserCode(user.code);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserCode(null);
    setFilters({
      agentCode: '',
      brokerCode: '',
      region: '',
      productName: '',
      dateFrom: '',
      dateTo: '',
      timeFrame: 'monthly',
      comparisonType: 'mom'
    });
  };

  const applyFilters = () => {
    if (!data) return;

    let filtered = [...data];

    if (userRole === 'agent') {
      filtered = filtered.filter(row => row['Agent Code'] === userCode);
    } else if (userRole === 'broker') {
      filtered = filtered.filter(row => row['Broker Code'] === userCode);
    }

    if (filters.agentCode && userRole !== 'agent') {
      filtered = filtered.filter(row => row['Agent Code'] === filters.agentCode);
    }
    if (filters.brokerCode && userRole === 'supervisor') {
      filtered = filtered.filter(row => row['Broker Code'] === filters.brokerCode);
    }
    if (filters.region) {
      filtered = filtered.filter(row => row['Customer Region'] === filters.region);
    }
    if (filters.productName) {
      filtered = filtered.filter(row => row['Product Name'] === filters.productName);
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(row => row.Date >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(row => row.Date <= toDate);
    }

    setFilteredData(filtered);
  };

  const renderChart = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    try {
      const chartElement = document.getElementById('chart');
      if (!chartElement) return;

      Plotly.purge(chartElement);

      const chartFunctions = {
        overview: () => chartUtils.createOverviewChart(filteredData),
        monthly: () => chartUtils.createMonthlyChart(filteredData),
        products: () => chartUtils.createProductsChart(filteredData),
        seasonal: () => chartUtils.createSeasonalChart(filteredData),
        regional: () => chartUtils.createRegionalChart(filteredData),
        agents: () => chartUtils.createAgentPerformanceChart(filteredData),
        forecast: () => chartUtils.createForecastChart(filteredData),
        comparison: () => chartUtils.createComparativeAnalysisChart(filteredData, comparisonMetrics)
      };

      const chartFunction = chartFunctions[activeTab] || chartFunctions.overview;
      chartFunction();
    } catch (error) {
      console.error('Error rendering chart:', error);
    }
  };

  const exportData = (format) => {
    if (!filteredData) return;
    
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'csv') {
      const headers = Object.keys(filteredData[0]);
      const csvRows = [headers.join(',')];
      
      filteredData.forEach(row => {
        const values = headers.map(header => {
          const val = row[header];
          if (val instanceof Date) {
            return val.toISOString().split('T')[0];
          }
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      });
      
      content = csvRows.join('\n');
      filename = `sales_data_${userRole}_${new Date().toISOString().slice(0,10)}.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(filteredData, null, 2);
      filename = `sales_data_${userRole}_${new Date().toISOString().slice(0,10)}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const metrics = calculationUtils.calculateMetrics(filteredData, comparisonMetrics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <DashboardHeader 
          userRole={userRole} 
          userCode={userCode} 
          onLogout={handleLogout}
          onExport={exportData}
        />

        {isLoading && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <p className="text-gray-600">Loading sales data...</p>
            </div>
          </div>
        )}

        {!isLoading && data && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              ✅ Data loaded successfully: {data.length} records
            </p>
            <p className="text-green-700 text-sm mt-1">
              Data period: {data[0]?.Date.toLocaleDateString()} to {data[data.length-1]?.Date.toLocaleDateString()}
            </p>
          </div>
        )}

        <MetricsCards metrics={metrics} />

        <FilterSection 
          filters={filters}
          setFilters={setFilters}
          userRole={userRole}
          userCode={userCode}
          data={data}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        <ChartTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="bg-white rounded-lg shadow-lg p-6">
          {!data ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading data...</p>
              </div>
            </div>
          ) : !filteredData ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Processing data...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-gray-600 text-xl">No data available for current filters</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filter settings</p>
              </div>
            </div>
          ) : (
            <div id="chart" className="w-full" style={{ height: '600px' }}></div>
          )}
        </div>

        <StatsPanel filteredData={filteredData} userRole={userRole} />
      </div>
    </div>
  );
};

export default SalesDashboard;