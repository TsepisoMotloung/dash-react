// calculationUtils.js
// Helpers to compute metrics used across the dashboard

const sum = (arr) => arr.reduce((s, v) => s + (v || 0), 0);

const formatMonth = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const calculationUtils = {
  // Aggregate total revenue by month (YYYY-MM)
  aggregateByMonth: (data) => {
    const map = {};
    if (!data) return map;
    data.forEach(row => {
      const month = formatMonth(row.Date);
      map[month] = (map[month] || 0) + (row['Total Revenue'] || 0);
    });
    return map;
  },

  aggregateByProduct: (data, topN = 10) => {
    const map = {};
    if (!data) return [];
    data.forEach(r => {
      const p = r['Product Name'] || 'Unknown';
      map[p] = (map[p] || 0) + (r['Total Revenue'] || 0);
    });
    return Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, topN);
  },

  aggregateByAgent: (data, topN = 10) => {
    const map = {};
    const volumeMap = {};
    if (!data) return [];
    data.forEach(r => {
      const a = r['Agent Code'] || 'Unknown';
      map[a] = (map[a] || 0) + (r['Total Revenue'] || 0);
      volumeMap[a] = (volumeMap[a] || 0) + (r['Sales Volume'] || 0);
    });
    return Object.keys(map)
      .map(k => [k, map[k], volumeMap[k]])
      .sort((a,b) => b[1] - a[1])
      .slice(0, topN);
  },

  aggregateByRegion: (data) => {
    const map = {};
    if (!data) return map;
    data.forEach(r => {
      const reg = r['Customer Region'] || 'Unknown';
      map[reg] = (map[reg] || 0) + (r['Total Revenue'] || 0);
    });
    return map;
  },

  calculateSeasonalData: (data) => {
    // Group by month name (Jan, Feb...) across years
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenue = new Array(12).fill(0);
    const transactions = new Array(12).fill(0);
    if (data) {
      data.forEach(r => {
        const d = new Date(r.Date);
        const idx = d.getMonth();
        revenue[idx] += (r['Total Revenue'] || 0);
        transactions[idx] += 1;
      });
    }
    return { months, revenue, transactions };
  },

  // Return time series labels, values and moving averages (6 & 12)
  getTimeSeriesWithMA: (data, metric = 'revenue') => {
    const monthlyMap = {};
    if (!data) return { labels: [], values: [], ma6: [], ma12: [], ma6Start: 0, ma12Start: 0 };
    
    data.forEach(r => {
      const m = formatMonth(r.Date);
      const val = metric === 'revenue' ? (r['Total Revenue'] || 0) : (r['Sales Volume'] || 0);
      monthlyMap[m] = (monthlyMap[m] || 0) + val;
    });
    
    const labels = Object.keys(monthlyMap).sort();
    const values = labels.map(l => monthlyMap[l] || 0);

    const ma6 = [];
    const ma12 = [];
    
    for (let i = 0; i < values.length; i++) {
      // 6-month moving average (needs at least 6 data points)
      if (i >= 5) {
        const window = values.slice(i - 5, i + 1);
        ma6.push(sum(window) / window.length);
      }
      // 12-month moving average (needs at least 12 data points)
      if (i >= 11) {
        const window = values.slice(i - 11, i + 1);
        ma12.push(sum(window) / window.length);
      }
    }

    const ma6Start = values.length >= 6 ? 5 : values.length; // index where ma6 aligns
    const ma12Start = values.length >= 12 ? 11 : values.length;

    return { labels, values, ma6, ma12, ma6Start, ma12Start };
  },

  getRevenueDistribution: (data) => {
    if (!data) return [];
    // Return array of monthly revenue values for histogram
    const monthly = calculationUtils.aggregateByMonth(data);
    const months = Object.keys(monthly).sort();
    return months.map(m => monthly[m]);
  },

  // Compute high level metrics object used by MetricsCards
  calculateMetrics: (filteredData, comparisonMetrics = {}) => {
    if (!filteredData || filteredData.length === 0) return null;

    const totalRevenue = sum(filteredData.map(r => r['Total Revenue'] || 0));
    const totalVolume = sum(filteredData.map(r => r['Sales Volume'] || 0));
    const uniqueAgents = new Set(filteredData.map(r => r['Agent Code'])).size;
    const uniqueRegions = new Set(filteredData.map(r => r['Customer Region'])).size;

    const topProductArr = calculationUtils.aggregateByProduct(filteredData, 1)[0] || ['-', 0];
    const topProduct = topProductArr[0];
    const topProductRevenue = topProductArr[1] || 0;

    const avgRevenuePerUnit = totalVolume > 0 ? totalRevenue / totalVolume : (filteredData.length > 0 ? totalRevenue / filteredData.length : 0);

    const topAgentArr = calculationUtils.aggregateByAgent(filteredData, 1)[0] || ['-', 0, 0];
    const topAgent = topAgentArr[0];
    const topAgentRevenue = topAgentArr[1] || 0;
    const topAgentVolume = topAgentArr[2] || 0;

    // revenueGrowth: prefer value from comparisonMetrics if provided, otherwise compute simple MoM
    let revenueGrowth = (comparisonMetrics && typeof comparisonMetrics.revenueGrowth === 'number') ? comparisonMetrics.revenueGrowth : 0;
    
    // As fallback compute last vs previous month percent change
    try {
      const ts = calculationUtils.getTimeSeriesWithMA(filteredData, 'revenue');
      const vals = ts.values;
      if (vals.length >= 2) {
        const last = vals[vals.length - 1];
        const prev = vals[vals.length - 2] || 0;
        revenueGrowth = prev === 0 ? 0 : ((last - prev) / Math.abs(prev)) * 100;
      }
    } catch (e) {
      // ignore
    }

    // Simple overall growth placeholder
    const growth = revenueGrowth;

    return {
      totalRevenue,
      revenueGrowth,
      growth,
      uniqueAgents,
      uniqueRegions,
      topProduct,
      topProductRevenue,
      totalVolume,
      avgRevenuePerUnit,
      topAgent,
      topAgentRevenue,
      topAgentVolume
    };
  },

  // Calculate comparison metrics (e.g., MoM, YoY) - minimal implementation
  calculateComparisonMetrics: (filteredData, allData, filters = {}, userRole = null, userCode = null) => {
    // For now compute simple MoM revenue growth based on filteredData
    if (!filteredData || filteredData.length === 0) return { revenueGrowth: 0 };
    
    try {
      const ts = calculationUtils.getTimeSeriesWithMA(filteredData, 'revenue');
      const vals = ts.values;
      if (vals.length >= 2) {
        const last = vals[vals.length - 1];
        const prev = vals[vals.length - 2] || 0;
        const revenueGrowth = prev === 0 ? 0 : ((last - prev) / Math.abs(prev)) * 100;
        return { revenueGrowth };
      }
    } catch (e) {
      // ignore
    }
    return { revenueGrowth: 0 };
  }
};

export default calculationUtils;