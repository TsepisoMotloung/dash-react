import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Plotly from 'plotly.js-dist';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign } from 'lucide-react';

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const users = {
    // Supervisors (2)
    'supervisor1': { password: 'admin123', role: 'supervisor', code: 'SUP001' },
    'supervisor2': { password: 'admin123', role: 'supervisor', code: 'SUP002' },
    
    // Brokers (4)
    'broker1': { password: 'pass123', role: 'broker', code: 'BRK001' },
    'broker2': { password: 'pass123', role: 'broker', code: 'BRK002' },
    'broker3': { password: 'pass123', role: 'broker', code: 'BRK003' },
    'broker4': { password: 'pass123', role: 'broker', code: 'BRK004' },
    
    // Agents (10)
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
  };

  // Load data from public directory when component mounts
  useEffect(() => {
    loadDataFromPublic();
  }, []);

  useEffect(() => {
    if (data) {
      applyFilters();
    }
  }, [data, filters, userRole, userCode]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      calculateComparisonMetrics();
    }
  }, [filteredData, filters.comparisonType]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      renderChart();
    }
  }, [activeTab, filteredData, filters.timeFrame, comparisonMetrics]);

  const loadDataFromPublic = async () => {
    setIsLoading(true);
    try {
      // Try different possible file names in the public directory
      const possibleFiles = [
        '/sales_data.xlsx',
        '/sales_data.xls',
        '/data.xlsx',
        '/sample_data.xlsx',
        '/sales_sample.xlsx'
      ];

      let fileFound = false;
      
      for (const filePath of possibleFiles) {
        try {
          const response = await fetch(filePath);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const processedData = jsonData.map(row => {
              // Handle different date formats
              let dateValue;
              if (row.Date instanceof Date) {
                dateValue = row.Date;
              } else if (typeof row.Date === 'string') {
                dateValue = new Date(row.Date);
                if (isNaN(dateValue.getTime())) {
                  // Try Excel serial number format
                  const excelDate = parseFloat(row.Date);
                  if (!isNaN(excelDate)) {
                    dateValue = new Date((excelDate - 25569) * 86400 * 1000);
                  }
                }
              } else if (typeof row.Date === 'number') {
                // Excel serial number
                dateValue = new Date((row.Date - 25569) * 86400 * 1000);
              }

              return {
                ...row,
                Date: dateValue && !isNaN(dateValue.getTime()) ? dateValue : new Date(),
                'Total Revenue': parseFloat(row['Total Revenue']) || 0,
                'Agent Code': row['Agent Code']?.toString() || '',
                'Broker Code': row['Broker Code']?.toString() || '',
                'Product Name': row['Product Name']?.toString() || '',
                'Customer Region': row['Customer Region']?.toString() || ''
              };
            }).filter(row => row.Date && !isNaN(row.Date.getTime()));
            
            setData(processedData);
            console.log('Data loaded successfully:', processedData.length, 'records');
            fileFound = true;
            break;
          }
        } catch (error) {
          console.log(`File not found at ${filePath}, trying next...`);
        }
      }

      if (!fileFound) {
        // Create sample data if no file found
        createSampleData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Create sample data as fallback
      createSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleData = () => {
    const sampleData = [];
    const products = ['Life Insurance', 'Health Insurance', 'Auto Insurance', 'Home Insurance', 'Travel Insurance'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const agentCodes = ['AGT001', 'AGT002', 'AGT003', 'AGT004', 'AGT005'];
    const brokerCodes = ['BRK001', 'BRK002', 'BRK003', 'BRK004'];

    let date = new Date('2023-01-01');
    const endDate = new Date('2024-01-31');

    while (date <= endDate) {
      for (let i = 0; i < 20; i++) {
        sampleData.push({
          Date: new Date(date),
          'Total Revenue': Math.floor(Math.random() * 10000) + 1000,
          'Agent Code': agentCodes[Math.floor(Math.random() * agentCodes.length)],
          'Broker Code': brokerCodes[Math.floor(Math.random() * brokerCodes.length)],
          'Product Name': products[Math.floor(Math.random() * products.length)],
          'Customer Region': regions[Math.floor(Math.random() * regions.length)]
        });
      }
      date.setDate(date.getDate() + 7); // Move to next week
    }

    setData(sampleData);
    console.log('Sample data created:', sampleData.length, 'records');
  };

  const handleLogin = () => {
    const user = users[loginForm.username];
    
    if (user && user.password === loginForm.password) {
      setIsAuthenticated(true);
      setUserRole(user.role);
      setUserCode(user.code);
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserCode(null);
    setLoginForm({ username: '', password: '' });
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

  const calculateComparisonMetrics = () => {
    if (!filteredData || filteredData.length === 0) {
      setComparisonMetrics(null);
      return;
    }

    const currentData = [...filteredData];
    const currentPeriodRevenue = currentData.reduce((sum, row) => sum + row['Total Revenue'], 0);
    
    let previousPeriodRevenue = 0;
    let comparisonLabel = '';

    if (data && data.length > 0) {
      let previousData = [...data];
      
      // Apply same filters to previous data (excluding date filters which are handled by period)
      if (userRole === 'agent') {
        previousData = previousData.filter(row => row['Agent Code'] === userCode);
      } else if (userRole === 'broker') {
        previousData = previousData.filter(row => row['Broker Code'] === userCode);
      }

      if (filters.agentCode && userRole !== 'agent') {
        previousData = previousData.filter(row => row['Agent Code'] === filters.agentCode);
      }
      if (filters.brokerCode && userRole === 'supervisor') {
        previousData = previousData.filter(row => row['Broker Code'] === filters.brokerCode);
      }
      if (filters.region) {
        previousData = previousData.filter(row => row['Customer Region'] === filters.region);
      }
      if (filters.productName) {
        previousData = previousData.filter(row => row['Product Name'] === filters.productName);
      }

      // Filter by time period for comparison
      const currentDates = currentData.map(row => row.Date).sort((a, b) => a - b);
      const currentStartDate = currentDates[0];
      const currentEndDate = currentDates[currentDates.length - 1];
      
      switch (filters.comparisonType) {
        case 'mom':
          const momStartDate = new Date(currentStartDate);
          momStartDate.setMonth(momStartDate.getMonth() - 1);
          const momEndDate = new Date(currentEndDate);
          momEndDate.setMonth(momEndDate.getMonth() - 1);
          
          previousData = previousData.filter(row => 
            row.Date >= momStartDate && row.Date <= momEndDate
          );
          comparisonLabel = 'vs last month';
          break;
        
        case 'yoy':
          const yoyStartDate = new Date(currentStartDate);
          yoyStartDate.setFullYear(yoyStartDate.getFullYear() - 1);
          const yoyEndDate = new Date(currentEndDate);
          yoyEndDate.setFullYear(yoyEndDate.getFullYear() - 1);
          
          previousData = previousData.filter(row => 
            row.Date >= yoyStartDate && row.Date <= yoyEndDate
          );
          comparisonLabel = 'vs last year';
          break;
        
        case 'qtq':
          const currentQuarter = Math.floor(currentStartDate.getMonth() / 3) + 1;
          const previousQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
          const year = currentQuarter === 1 ? currentStartDate.getFullYear() - 1 : currentStartDate.getFullYear();
          
          const quarterStartMonth = (previousQuarter - 1) * 3;
          const qtqStartDate = new Date(year, quarterStartMonth, 1);
          const qtqEndDate = new Date(year, quarterStartMonth + 3, 0);
          
          previousData = previousData.filter(row => 
            row.Date >= qtqStartDate && row.Date <= qtqEndDate
          );
          comparisonLabel = 'vs previous quarter';
          break;
        
        case 'ytd':
          const currentYear = currentStartDate.getFullYear();
          const startOfLastYear = new Date(currentYear - 1, 0, 1);
          const endOfLastYear = new Date(currentYear - 1, 11, 31);
          
          previousData = previousData.filter(row => 
            row.Date >= startOfLastYear && row.Date <= endOfLastYear
          );
          comparisonLabel = 'vs YTD last year';
          break;
        
        default:
          comparisonLabel = 'vs previous period';
          break;
      }

      previousPeriodRevenue = previousData.reduce((sum, row) => sum + row['Total Revenue'], 0);
    }

    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : currentPeriodRevenue > 0 ? 100 : 0;

    setComparisonMetrics({
      currentRevenue: currentPeriodRevenue,
      previousRevenue: previousPeriodRevenue,
      revenueGrowth,
      comparisonLabel
    });
  };

  const calculateMetrics = () => {
    if (!filteredData || filteredData.length === 0) return null;

    const totalRevenue = filteredData.reduce((sum, row) => sum + row['Total Revenue'], 0);
    const avgRevenue = totalRevenue / filteredData.length;
    
    const monthlyRevenue = {};
    filteredData.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + row['Total Revenue'];
    });
    
    const months = Object.keys(monthlyRevenue).sort();
    let growth = 0;
    if (months.length >= 2) {
      const currentMonth = monthlyRevenue[months[months.length - 1]];
      const previousMonth = monthlyRevenue[months[months.length - 2]];
      growth = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 100;
    }

    const productRevenue = filteredData.reduce((acc, row) => {
      acc[row['Product Name']] = (acc[row['Product Name']] || 0) + row['Total Revenue'];
      return acc;
    }, {});

    const topProduct = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0];

    return {
      totalRevenue,
      avgRevenue,
      growth,
      topProduct: topProduct ? topProduct[0] : 'N/A',
      topProductRevenue: topProduct ? topProduct[1] : 0,
      uniqueAgents: new Set(filteredData.map(row => row['Agent Code'])).size,
      uniqueRegions: new Set(filteredData.map(row => row['Customer Region'])).size,
      revenueGrowth: comparisonMetrics ? comparisonMetrics.revenueGrowth : 0
    };
  };

  const renderChart = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    try {
      const chartElement = document.getElementById('chart');
      if (!chartElement) return;

      // Clear previous chart
      Plotly.purge(chartElement);

      switch(activeTab) {
        case 'overview':
          createOverviewChart(filteredData);
          break;
        case 'monthly':
          createMonthlyChart(filteredData);
          break;
        case 'products':
          createProductsChart(filteredData);
          break;
        case 'seasonal':
          createSeasonalChart(filteredData);
          break;
        case 'regional':
          createRegionalChart(filteredData);
          break;
        case 'agents':
          createAgentPerformanceChart(filteredData);
          break;
        case 'forecast':
          createForecastChart(filteredData);
          break;
        case 'comparison':
          createComparativeAnalysisChart(filteredData);
          break;
        default:
          createOverviewChart(filteredData);
          break;
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
    }
  };

  const createOverviewChart = (data) => {
    const monthlyData = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + row['Total Revenue'];
    });

    const months = Object.keys(monthlyData).sort();
    const revenues = months.map(m => monthlyData[m]);

    const trace = {
      x: months,
      y: revenues,
      type: 'bar',
      marker: {
        color: revenues,
        colorscale: 'Viridis',
        line: { color: '#2d5016', width: 1.5 }
      },
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const layout = {
      title: { text: 'Revenue Overview - Monthly Performance', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Month', tickangle: -45, gridcolor: '#e5e7eb' },
      yaxis: { title: 'Total Revenue (M)', gridcolor: '#e5e7eb' },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      hovermode: 'closest',
      margin: { t: 80, b: 100, l: 80, r: 40 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const createMonthlyChart = (data) => {
    const monthlyData = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + row['Total Revenue'];
    });

    const months = Object.keys(monthlyData).sort();
    const revenues = months.map(m => monthlyData[m]);

    const trace = {
      x: months,
      y: revenues,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#3b82f6', width: 3 },
      marker: { size: 8, color: '#1d4ed8' },
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const layout = {
      title: { text: 'Monthly Revenue Trend', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Month', tickangle: -45, gridcolor: '#e5e7eb' },
      yaxis: { title: 'Total Revenue (M)', gridcolor: '#e5e7eb' },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      hovermode: 'closest',
      margin: { t: 80, b: 100, l: 80, r: 40 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const createProductsChart = (data) => {
    const productData = {};
    data.forEach(row => {
      const product = row['Product Name'];
      productData[product] = (productData[product] || 0) + row['Total Revenue'];
    });

    const sorted = Object.entries(productData).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const trace = {
      x: sorted.map(s => s[0]),
      y: sorted.map(s => s[1]),
      type: 'bar',
      marker: {
        color: sorted.map((_, i) => `hsl(${i * 45}, 70%, 50%)`),
        line: { color: '#1f2937', width: 1 }
      },
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const layout = {
      title: { text: 'Top Products by Revenue', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Product Name', tickangle: -45, gridcolor: '#e5e7eb' },
      yaxis: { title: 'Total Revenue (M)', gridcolor: '#e5e7eb' },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      hovermode: 'closest',
      margin: { t: 80, b: 120, l: 80, r: 40 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const createSeasonalChart = (data) => {
    const monthlyData = Array(12).fill(0);
    const transactionCount = Array(12).fill(0);
    
    data.forEach(row => {
      const month = row.Date.getMonth();
      monthlyData[month] += row['Total Revenue'];
      transactionCount[month] += 1;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trace1 = {
      x: monthNames,
      y: monthlyData,
      type: 'bar',
      name: 'Revenue',
      marker: { color: '#6366f1' },
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const trace2 = {
      x: monthNames,
      y: transactionCount,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Transactions',
      yaxis: 'y2',
      line: { color: '#ef4444', width: 3 },
      marker: { size: 6 },
      hovertemplate: '<b>%{x}</b><br>Transactions: %{y}<extra></extra>'
    };

    const layout = {
      title: { text: 'Seasonal Analysis - Revenue vs Transactions', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Month', gridcolor: '#e5e7eb' },
      yaxis: { title: 'Revenue (M)', gridcolor: '#e5e7eb' },
      yaxis2: {
        title: 'Number of Transactions',
        overlaying: 'y',
        side: 'right',
        gridcolor: '#e5e7eb'
      },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      hovermode: 'closest',
      margin: { t: 80, b: 80, l: 80, r: 80 }
    };

    Plotly.newPlot('chart', [trace1, trace2], layout, { responsive: true });
  };

  const createRegionalChart = (data) => {
    const regionalData = {};
    data.forEach(row => {
      const region = row['Customer Region'];
      regionalData[region] = (regionalData[region] || 0) + row['Total Revenue'];
    });

    const regions = Object.keys(regionalData);
    const revenues = regions.map(r => regionalData[r]);

    const trace = {
      labels: regions,
      values: revenues,
      type: 'pie',
      hole: 0.4,
      marker: { colors: ['#fef3c7', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309'] },
      textinfo: 'label+percent',
      hovertemplate: '<b>%{label}</b><br>Revenue: M%{value:,.0f}<br>%{percent}<extra></extra>'
    };

    const layout = {
      title: { text: 'Regional Revenue Distribution', font: { size: 24, color: '#1f2937' } },
      paper_bgcolor: '#ffffff',
      showlegend: true,
      legend: { x: 1, y: 0.5 },
      margin: { t: 80, b: 40, l: 40, r: 120 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const createAgentPerformanceChart = (data) => {
    const agentData = {};
    data.forEach(row => {
      const agent = row['Agent Code'];
      agentData[agent] = (agentData[agent] || 0) + row['Total Revenue'];
    });

    const sorted = Object.entries(agentData).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const trace = {
      x: sorted.map(s => s[1]),
      y: sorted.map(s => s[0]),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: sorted.map((_, i) => `hsl(${i * 36}, 70%, 50%)`),
        line: { color: '#1f2937', width: 1 }
      },
      hovertemplate: '<b>%{y}</b><br>Revenue: M%{x:,.0f}<extra></extra>'
    };

    const layout = {
      title: { text: 'Top 10 Agents by Revenue', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Total Revenue (M)' },
      yaxis: { title: 'Agent Code' },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      margin: { t: 80, b: 80, l: 120, r: 40 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const createForecastChart = (data) => {
    const monthlyData = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + row['Total Revenue'];
    });

    const revenues = Object.values(monthlyData);

    const trace = {
      x: revenues,
      type: 'histogram',
      nbinsx: 12,
      marker: { color: '#6366f1', line: { color: '#4338ca', width: 1 } },
      hovertemplate: 'Revenue: M%{x:,.0f}<br>Frequency: %{y}<extra></extra>'
    };

    const layout = {
      title: { text: 'Revenue Distribution Analysis', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Monthly Revenue (M)', gridcolor: '#e5e7eb' },
      yaxis: { title: 'Frequency', gridcolor: '#e5e7eb' },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      margin: { t: 80, b: 80, l: 80, r: 40 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const createComparativeAnalysisChart = (data) => {
    if (!comparisonMetrics) {
      // Show message when no comparison data available
      const layout = {
        title: { text: 'Comparative Analysis', font: { size: 24, color: '#1f2937' } },
        xaxis: { visible: false },
        yaxis: { visible: false },
        annotations: [{
          text: 'No comparison data available for current filters',
          xref: 'paper',
          yref: 'paper',
          x: 0.5,
          y: 0.5,
          showarrow: false,
          font: { size: 16, color: '#6b7280' }
        }],
        plot_bgcolor: '#f9fafb',
        paper_bgcolor: '#ffffff'
      };
      Plotly.newPlot('chart', [], layout, { responsive: true });
      return;
    }

    const periods = ['Previous Period', 'Current Period'];
    const revenues = [comparisonMetrics.previousRevenue, comparisonMetrics.currentRevenue];

    const trace = {
      x: periods,
      y: revenues,
      type: 'bar',
      marker: {
        color: ['#f87171', '#4ade80'],
        line: { color: '#1f2937', width: 1 }
      },
      text: revenues.map(r => `M${(r/1000).toFixed(1)}K`),
      textposition: 'auto',
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const layout = {
      title: { 
        text: `Revenue Comparison: ${comparisonMetrics.comparisonLabel}`, 
        font: { size: 24, color: '#1f2937' } 
      },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Revenue (M)' },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      margin: { t: 80, b: 80, l: 80, r: 40 }
    };

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  };

  const getUniqueValues = (field) => {
    if (!data) return [];
    return [...new Set(data.map(row => row[field]))].filter(Boolean).sort();
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
    setShowExportMenu(false);
  };

  const MetricsCards = () => {
    const metrics = calculateMetrics();
    if (!metrics) return null;

    const formatCurrency = (value) => {
      if (value >= 1000000) {
        return `M${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `M${(value / 1000).toFixed(1)}K`;
      }
      return `M${value.toFixed(0)}`;
    };

    const getGrowthColor = (value) => {
      if (value > 0) return 'text-green-600';
      if (value < 0) return 'text-red-600';
      return 'text-gray-600';
    };

    const getGrowthIcon = (value) => {
      if (value > 0) return '↗';
      if (value < 0) return '↘';
      return '→';
    };

    const getGrowthBgColor = (value) => {
      if (value > 0) return 'bg-green-50 border-green-200';
      if (value < 0) return 'bg-red-50 border-red-200';
      return 'bg-gray-50 border-gray-200';
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue Card */}
        <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 ${getGrowthBgColor(metrics.revenueGrowth)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getGrowthColor(metrics.revenueGrowth)}`}>
              {getGrowthIcon(metrics.revenueGrowth)} {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">vs previous period</span>
          </div>
        </div>

        {/* Sales Growth Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Sales Growth</h3>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.growth > 0 ? '+' : ''}{metrics.growth.toFixed(1)}%
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getGrowthColor(metrics.growth)}`}>
              {getGrowthIcon(metrics.growth)} Monthly
            </span>
          </div>
        </div>

        {/* Active Agents Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Active Agents</h3>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {metrics.uniqueAgents}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Across {metrics.uniqueRegions} regions</span>
          </div>
        </div>

        {/* Top Product Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Top Product</h3>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2 truncate">
            {metrics.topProduct}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatCurrency(metrics.topProductRevenue)} revenue
            </span>
          </div>
        </div>
      </div>
    );
  };

  const FilterSection = () => (
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

  const ChartTabs = () => (
    <div className="bg-white rounded-lg shadow-lg mb-6 p-2">
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'monthly', label: '📈 Monthly Growth', icon: '📈' },
          { id: 'products', label: '🏆 Top Products', icon: '🏆' },
          { id: 'seasonal', label: '🌟 Seasonal Trends', icon: '🌟' },
          { id: 'regional', label: '🌍 Regional Performance', icon: '🌍' },
          { id: 'agents', label: '👥 Agent Performance', icon: '👥' },
          { id: 'forecast', label: '🔮 Revenue Forecast', icon: '🔮' },
          { id: 'comparison', label: '📋 Comparative Analysis', icon: '📋' }
        ].map((tab) => (
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Sales Dashboard</h2>
            <p className="text-gray-600 mt-2">Sign in to access your analytics</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-600">Supervisors: supervisor1 / admin123</p>
            <p className="text-xs text-gray-600">Brokers: broker1 / pass123</p>
            <p className="text-xs text-gray-600">Agents: agent1 / pass123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
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
                      onClick={() => exportData('csv')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-t-lg transition-all"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => exportData('json')}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-b-lg transition-all"
                    >
                      Export as JSON
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

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

        {/* Metrics Cards */}
        <MetricsCards />

        {/* Filters */}
        <FilterSection />

        {/* Chart Tabs */}
        <ChartTabs />

        {/* Chart Container */}
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

        {filteredData && filteredData.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;