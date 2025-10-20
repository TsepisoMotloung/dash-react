import React, { useState, useEffect } from 'react';

import Plotly from 'plotly.js-dist';
import { dataUtils } from './utils/dataUtils';
import { calculationUtils } from './utils/calculationUtils';
import { chartUtils } from './utils/chartUtils';
import { ChartTabs, FilterSection, DashboardHeader, LoginForm, MetricsCards, StatsPanel, ComparisonMetricsCards, Breakdown } from './components';
import { Menu, X, TrendingUp,  Users, TrendingDown, BarChart3, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      const sampleData = await getSalesData();
      console.log(sampleData);
      setData(sampleData);
      setIsLoading(false);
    };
        
    loadData();
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
  }, [activeTab, filteredData, filters.timeFrame]);

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
      if (activeTab === 'comparison') {
        // Render both revenue and volume charts for comparison tab
        setTimeout(() => {
          const revenueElement = document.getElementById('revenueChart');
          const volumeElement = document.getElementById('volumeChart');
          
          console.log('Rendering comparison charts...');
          console.log('Revenue element:', revenueElement);
          console.log('Volume element:', volumeElement);
                  
          if (revenueElement) {
            Plotly.purge(revenueElement);
            chartUtils.createComparativeAnalysisChart(filteredData, 'revenue', 'revenueChart');
            console.log('Revenue chart rendered');
          } else {
            console.error('revenueChart element not found in DOM');
          }
                  
          if (volumeElement) {
            Plotly.purge(volumeElement);
            chartUtils.createComparativeAnalysisChart(filteredData, 'volume', 'volumeChart');
            console.log('Volume chart rendered');
          } else {
            console.error('volumeChart element not found in DOM');
          }
        }, 100);
      } else {
        // Render single chart for other tabs
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
          forecast: () => chartUtils.createForecastChart(filteredData)
        };
        const chartFunction = chartFunctions[activeTab] || chartFunctions.overview;
        chartFunction();
      }
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'breakdown', label: 'Breakdown', icon: BarChart3 },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: TrendingDown }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen bg-white shadow-2xl z-40
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-gray-800">Analytics</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
                            
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  {sidebarOpen && (
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {tab.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-700">Active View</p>
                <p className="text-sm text-gray-600 mt-1">{tabs.find(t => t.id === activeTab)?.label}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-20 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="w-full p-4 lg:p-6">
          <DashboardHeader
            userRole={userRole}
            userCode={userCode}
            onLogout={handleLogout}
            onExport={exportData}
          />

          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <p className="text-gray-600">Loading sales data...</p>
              </div>
            </div>
          )}

          {!isLoading && data && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4 shadow-lg">
              <p className="text-green-800 font-semibold flex items-center gap-2">
                <span className="text-xl">✅</span> Data loaded successfully: {data.length} records
              </p>
              <p className="text-green-700 text-sm mt-1">
                Data period: {data[0]?.Date.toLocaleDateString()} to {data[data.length-1]?.Date.toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-800">Filters</h3>
                <span className="text-sm text-gray-500">
                  ({Object.values(filters).filter(v => v).length} active)
                </span>
              </div>
              {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showFilters && (
              <FilterSection
                filters={filters}
                setFilters={setFilters}
                userRole={userRole}
                userCode={userCode}
                data={data}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
              />
            )}
          </div>
            
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <MetricsCards metrics={metrics} />
              
              {/* Revenue & Volume Overview Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                {!filteredData || filteredData.length === 0 ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <p className="text-gray-600 text-xl">No data available</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                    </div>
                  </div>
                ) : (
                  <div id="chart" className="w-full" style={{ height: '600px' }}></div>
                )}
              </div>
              
              <StatsPanel filteredData={filteredData} userRole={userRole} />
            </>
          )}

          {/* COMPARISON TAB */}
          {activeTab === 'comparison' && (
            <>
              <ComparisonMetricsCards
                data={filteredData}
                currentDate={filteredData?.[filteredData.length - 1]?.Date?.toISOString().slice(0, 7)}
              />
                            
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Revenue Trend</h3>
                  {!filteredData || filteredData.length === 0 ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <p className="text-gray-600 text-xl">No data available</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                      </div>
                    </div>
                  ) : (
                    <div id="revenueChart" className="w-full" style={{ height: '400px' }}></div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Volume Trend</h3>
                  {!filteredData || filteredData.length === 0 ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <p className="text-gray-600 text-xl">No data available</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                      </div>
                    </div>
                  ) : (
                    <div id="volumeChart" className="w-full" style={{ height: '400px' }}></div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* BREAKDOWN TAB */}
          {activeTab === 'breakdown' && (
            <Breakdown filteredData={filteredData} />
          )}

          {/* OTHER TABS (agents, forecast, etc.) */}
          {activeTab !== 'overview' && activeTab !== 'comparison' && activeTab !== 'breakdown' && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
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
          )}
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;