// utils/calculationUtils.js

export const calculationUtils = {
  /**
   * Calculate moving average for a time series
   * @param {Array} data - Array of [date, value] pairs
   * @param {number} periods - Number of periods for moving average
   * @returns {Array} Array of [date, avgValue] pairs
   */
  calculateMovingAverage: (data, periods) => {
    if (!data || data.length < periods) return [];
    
    const result = [];
    for (let i = periods - 1; i < data.length; i++) {
      const sum = data.slice(i - periods + 1, i + 1).reduce((acc, [_, val]) => acc + val, 0);
      result.push([data[i][0], sum / periods]);
    }
    return result;
  },

  /**
   * Calculate period-over-period comparisons for revenue and volume
   * @param {Array} data - Full dataset
   * @param {string} date - Target date (YYYY-MM)
   * @param {string} compareType - 'mom' (month), 'qoq' (quarter), 'yoy' (year), or 'ytd'
   * @returns {Object} Comparison metrics for revenue and volume
   */
  calculatePeriodComparison: (data, date, compareType = 'mom') => {
    if (!data || data.length === 0 || !date) return null;

    const [year, month] = date.split('-').map(Number);
    const targetDate = new Date(year, month - 1);
    
    // Helper to get start/end dates for a period
    const getPeriodDates = (date, type) => {
      const start = new Date(date);
      const end = new Date(date);
      
      switch (type) {
        case 'mom':
          end.setMonth(end.getMonth() + 1);
          break;
        case 'qoq':
          start.setMonth(Math.floor(start.getMonth() / 3) * 3);
          end.setMonth(Math.floor(end.getMonth() / 3) * 3 + 3);
          break;
        case 'yoy':
          start.setMonth(0);
          end.setMonth(12);
          break;
        case 'ytd':
          start.setMonth(0);
          break;
      }
      return [start, end];
    };

    // Get current period data
    const [currentStart, currentEnd] = getPeriodDates(targetDate, compareType);
    const currentData = data.filter(row => 
      row.Date >= currentStart && row.Date < currentEnd
    );

    // Get previous period data
    const prevDate = new Date(targetDate);
    switch (compareType) {
      case 'mom': prevDate.setMonth(prevDate.getMonth() - 1); break;
      case 'qoq': prevDate.setMonth(prevDate.getMonth() - 3); break;
      case 'yoy': prevDate.setFullYear(prevDate.getFullYear() - 1); break;
      case 'ytd': prevDate.setFullYear(prevDate.getFullYear() - 1); break;
    }
    
    const [prevStart, prevEnd] = getPeriodDates(prevDate, compareType);
    const previousData = data.filter(row => 
      row.Date >= prevStart && row.Date < prevEnd
    );

    // Calculate metrics
    const calcPeriodMetrics = (data) => ({
      revenue: data.reduce((sum, row) => sum + (row['Total Revenue'] || 0), 0),
      volume: data.reduce((sum, row) => sum + (row['Sales Volume'] || 0), 0)
    });

    const current = calcPeriodMetrics(currentData);
    const previous = calcPeriodMetrics(previousData);

    // Calculate growth percentages
    const calcGrowth = (curr, prev) => 
      prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;

    return {
      current,
      previous,
      growth: {
        revenue: calcGrowth(current.revenue, previous.revenue),
        volume: calcGrowth(current.volume, previous.volume)
      },
      periodLabel: {
        mom: 'vs. Previous Month',
        qoq: 'vs. Previous Quarter',
        yoy: 'vs. Previous Year',
        ytd: 'Year-to-Date Growth'
      }[compareType]
    };
  },

  /**
   * Get monthly time series with moving averages
   * @param {Array} data - Full dataset
   * @param {string} metric - 'revenue' or 'volume'
   * @returns {Object} Time series data with moving averages
   */
  getTimeSeriesWithMA: (data, metric = 'revenue') => {
    if (!data || data.length === 0) return null;

    // Group by month
    const monthly = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthly[month] = monthly[month] || { revenue: 0, volume: 0 };
      monthly[month].revenue += row['Total Revenue'] || 0;
      monthly[month].volume += row['Sales Volume'] || 0;
    });

    // Convert to arrays for moving averages
    const months = Object.keys(monthly).sort();
    const values = months.map(m => [m, monthly[m][metric]]);

    // Calculate moving averages
    const ma6 = calculationUtils.calculateMovingAverage(values, 6);
    const ma12 = calculationUtils.calculateMovingAverage(values, 12);

    return {
      labels: months,
      values: months.map(m => monthly[m][metric]),
      ma6: ma6.map(([_, val]) => val),
      ma12: ma12.map(([_, val]) => val),
      ma6Start: months.indexOf(ma6[0]?.[0]),
      ma12Start: months.indexOf(ma12[0]?.[0])
    };
  },

  /**
   * Calculate comparison metrics between current and previous period
   * @param {Array} filteredData - Current period data
   * @param {Array} allData - All available data
   * @param {Object} filters - Active filters
   * @param {string} userRole - User role (agent/broker/supervisor)
   * @param {string} userCode - User identification code
   * @returns {Object} Comparison metrics object
   */
  calculateComparisonMetrics: (filteredData, allData, filters, userRole, userCode) => {
    if (!filteredData || filteredData.length === 0) {
      return null;
    }

    const currentPeriodRevenue = filteredData.reduce((sum, row) => sum + row['Total Revenue'], 0);
    let previousPeriodRevenue = 0;
    let comparisonLabel = '';

    if (allData && allData.length > 0) {
      let previousData = [...allData];
      
      // Apply role-based filtering
      if (userRole === 'agent') {
        previousData = previousData.filter(row => row['Agent Code'] === userCode);
      } else if (userRole === 'broker') {
        previousData = previousData.filter(row => row['Broker Code'] === userCode);
      }

      // Apply additional filters
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

      const currentDates = filteredData.map(row => row.Date).sort((a, b) => a - b);
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
        
        default:
          comparisonLabel = 'vs previous period';
          break;
      }

      previousPeriodRevenue = previousData.reduce((sum, row) => sum + row['Total Revenue'], 0);
    }

    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : currentPeriodRevenue > 0 ? 100 : 0;

    return {
      currentRevenue: currentPeriodRevenue,
      previousRevenue: previousPeriodRevenue,
      revenueGrowth,
      comparisonLabel
    };
  },

  /**
   * Calculate key performance metrics from filtered data
   * @param {Array} filteredData - Filtered data array
   * @param {Object} comparisonMetrics - Optional comparison metrics
   * @returns {Object} Metrics object
   */
  calculateMetrics: (filteredData, comparisonMetrics = null) => {
    if (!filteredData || filteredData.length === 0) return null;
    const totalRevenue = filteredData.reduce((sum, row) => sum + row['Total Revenue'], 0);
    const totalVolume = filteredData.reduce((sum, row) => sum + (row['Sales Volume'] || 0), 0);
    const avgRevenue = filteredData.length > 0 ? totalRevenue / filteredData.length : 0;
    const avgRevenuePerUnit = totalVolume > 0 ? totalRevenue / totalVolume : 0;
    
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

    // Calculate top agent by revenue and by volume
    const agentData = filteredData.reduce((acc, row) => {
      const agent = row['Agent Code'] || 'Unknown';
      acc[agent] = acc[agent] || { revenue: 0, volume: 0 };
      acc[agent].revenue += row['Total Revenue'] || 0;
      acc[agent].volume += row['Sales Volume'] || 0;
      return acc;
    }, {});

    const topAgentEntry = Object.entries(agentData)
      .sort((a, b) => b[1].revenue - a[1].revenue)[0];

    return {
      totalRevenue,
      totalVolume,
      avgRevenue,
      avgRevenuePerUnit,
      growth,
      topProduct: topProduct ? topProduct[0] : 'N/A',
      topProductRevenue: topProduct ? topProduct[1] : 0,
      topAgent: topAgentEntry ? topAgentEntry[0] : 'N/A',
      topAgentRevenue: topAgentEntry ? topAgentEntry[1].revenue : 0,
      topAgentVolume: topAgentEntry ? topAgentEntry[1].volume : 0,
      uniqueAgents: new Set(filteredData.map(row => row['Agent Code'])).size,
      uniqueRegions: new Set(filteredData.map(row => row['Customer Region'])).size,
      revenueGrowth: comparisonMetrics ? comparisonMetrics.revenueGrowth : 0
    };
  },

  /**
   * Aggregate data by month
   * @param {Array} data - Data array
   * @returns {Object} Monthly aggregated data
   */
  aggregateByMonth: (data) => {
    const monthlyData = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + row['Total Revenue'];
    });
    return monthlyData;
  },

  /**
   * Aggregate data by product
   * @param {Array} data - Data array
   * @param {number} limit - Maximum number of products to return
   * @returns {Array} Sorted array of [product, revenue] tuples
   */
  aggregateByProduct: (data, limit = null) => {
    const productData = {};
    data.forEach(row => {
      const product = row['Product Name'];
      productData[product] = (productData[product] || 0) + row['Total Revenue'];
    });

    const sorted = Object.entries(productData).sort((a, b) => b[1] - a[1]);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  /**
   * Aggregate data by region
   * @param {Array} data - Data array
   * @returns {Object} Regional aggregated data
   */
  aggregateByRegion: (data) => {
    const regionalData = {};
    data.forEach(row => {
      const region = row['Customer Region'];
      regionalData[region] = (regionalData[region] || 0) + row['Total Revenue'];
    });
    return regionalData;
  },

  /**
   * Aggregate data by agent
   * @param {Array} data - Data array
   * @param {number} limit - Maximum number of agents to return
   * @returns {Array} Sorted array of [agent, revenue] tuples
   */
  aggregateByAgent: (data, limit = null) => {
    const agentData = {};
    data.forEach(row => {
      const agent = row['Agent Code'];
      agentData[agent] = (agentData[agent] || 0) + row['Total Revenue'];
    });

    const sorted = Object.entries(agentData).sort((a, b) => b[1] - a[1]);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  /**
   * Calculate seasonal data (monthly aggregation across all years)
   * @param {Array} data - Data array
   * @returns {Object} Seasonal data with revenue and transaction counts
   */
  calculateSeasonalData: (data) => {
    const monthlyData = Array(12).fill(0);
    const transactionCount = Array(12).fill(0);
    
    data.forEach(row => {
      const month = row.Date.getMonth();
      monthlyData[month] += row['Total Revenue'];
      transactionCount[month] += 1;
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      months: monthNames,
      revenue: monthlyData,
      transactions: transactionCount
    };
  },

  /**
   * Get revenue distribution for histogram
   * @param {Array} data - Data array
   * @returns {Array} Array of monthly revenues
   */
  getRevenueDistribution: (data) => {
    const monthlyData = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + row['Total Revenue'];
    });

    return Object.values(monthlyData);
  }
};

