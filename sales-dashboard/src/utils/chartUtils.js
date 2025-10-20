import Plotly from 'plotly.js-dist';
import { calculationUtils } from './calculationUtils';

export const chartUtils = {
  /**
   * Create overview bar chart showing monthly revenue
   */
  createOverviewChart: (data, targetId = 'chart') => {
    // Monthly revenue (by month key YYYY-MM) and monthly sales volume (sum of Sales Volume per month)
    const monthlyRevenue = calculationUtils.aggregateByMonth(data);
    // build monthlyVolume from data (sales volume per month)
    const monthlyVolumeMap = {};
    data.forEach(row => {
      const month = row.Date.toISOString().slice(0,7);
      monthlyVolumeMap[month] = (monthlyVolumeMap[month] || 0) + (row['Sales Volume'] || 0);
    });

    const months = Array.from(new Set([...Object.keys(monthlyRevenue), ...Object.keys(monthlyVolumeMap)])).sort();
    const revenues = months.map(m => monthlyRevenue[m] || 0);
    const volumes = months.map(m => monthlyVolumeMap[m] || 0);

    const revenueTrace = {
      x: months,
      y: revenues,
      name: 'Revenue',
      type: 'bar',
      marker: {
        color: '#4f46e5',
        line: { color: '#312e81', width: 1 }
      },
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const volumeTrace = {
      x: months,
      y: volumes,
      name: 'Sales Volume',
      type: 'scatter',
      mode: 'lines+markers',
      yaxis: 'y2',
      line: { color: '#10b981', width: 3 },
      marker: { size: 6, color: '#059669' },
      hovertemplate: '<b>%{x}</b><br>Volume: %{y}<extra></extra>'
    };

    const layout = {
      title: { text: 'Revenue & Volume Overview - Monthly', font: { size: 24, color: '#1f2937' } },
      xaxis: { title: 'Month', tickangle: -45, gridcolor: '#e5e7eb' },
      yaxis: { title: 'Total Revenue (M)', gridcolor: '#e5e7eb' },
      yaxis2: {
        title: 'Sales Volume',
        overlaying: 'y',
        side: 'right',
        showgrid: false
      },
      legend: { orientation: 'h', y: -0.2 },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      hovermode: 'closest',
      margin: { t: 80, b: 120, l: 80, r: 80 }
    };

    Plotly.newPlot(targetId, [revenueTrace, volumeTrace], layout, { responsive: true });
  },

  /**
   * Create monthly trend line chart
   */
  createMonthlyChart: (data, targetId = 'chart') => {
    const monthlyData = calculationUtils.aggregateByMonth(data);
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

    Plotly.newPlot(targetId, [trace], layout, { responsive: true });
  },

  /**
   * Create products bar chart showing top products by revenue
   */
  createProductsChart: (data, targetId = 'chart') => {
    const sorted = calculationUtils.aggregateByProduct(data, 8);

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

    Plotly.newPlot(targetId, [trace], layout, { responsive: true });
  },

  /**
   * Create seasonal analysis chart with revenue and transactions
   */
  createSeasonalChart: (data, targetId = 'chart') => {
    const seasonalData = calculationUtils.calculateSeasonalData(data);

    const trace1 = {
      x: seasonalData.months,
      y: seasonalData.revenue,
      type: 'bar',
      name: 'Revenue',
      marker: { color: '#6366f1' },
      hovertemplate: '<b>%{x}</b><br>Revenue: M%{y:,.0f}<extra></extra>'
    };

    const trace2 = {
      x: seasonalData.months,
      y: seasonalData.transactions,
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

    Plotly.newPlot(targetId, [trace1, trace2], layout, { responsive: true });
  },

  /**
   * Create regional pie chart showing revenue distribution
   */
  createRegionalChart: (data, targetId = 'chart') => {
    const regionalData = calculationUtils.aggregateByRegion(data);
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

    Plotly.newPlot(targetId, [trace], layout, { responsive: true });
  },

  /**
   * Create agent performance horizontal bar chart
   */
  createAgentPerformanceChart: (data, targetId = 'chart') => {
    const sorted = calculationUtils.aggregateByAgent(data, 10);

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

    Plotly.newPlot(targetId, [trace], layout, { responsive: true });
  },

  /**
   * Create forecast/distribution histogram
   */
  createForecastChart: (data, targetId = 'chart') => {
    const revenues = calculationUtils.getRevenueDistribution(data);

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

    Plotly.newPlot(targetId, [trace], layout, { responsive: true });
  },

  /**
   * Create comparative analysis chart with 6-month and 12-month moving averages
   * This chart is used for both Sales Revenue and Sales Volume trends
   */
  createComparativeAnalysisChart: (data, metric = 'revenue', targetId = 'chart') => {
    console.log('=== Creating Comparative Analysis Chart ===');
    console.log('Metric:', metric);
    console.log('Target ID:', targetId);
    console.log('Data length:', data?.length);
    
    if (!data || data.length === 0) {
      const layout = {
        title: { 
          text: `${metric === 'revenue' ? 'Sales Revenue' : 'Sales Volume'} Trend Analysis`, 
          font: { size: 20, color: '#1f2937' } 
        },
        xaxis: { visible: false },
        yaxis: { visible: false },
        annotations: [{
          text: 'No data available for current filters',
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
      Plotly.newPlot(targetId, [], layout, { responsive: true });
      return;
    }

    const timeSeriesData = calculationUtils.getTimeSeriesWithMA(data, metric);
    
    console.log('Time series data:', {
      labelsCount: timeSeriesData.labels?.length,
      valuesCount: timeSeriesData.values?.length,
      ma6Count: timeSeriesData.ma6?.length,
      ma12Count: timeSeriesData.ma12?.length,
      ma6Start: timeSeriesData.ma6Start,
      ma12Start: timeSeriesData.ma12Start
    });
   
    const traces = [
      // Actual values
      {
        x: timeSeriesData.labels,
        y: timeSeriesData.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: metric === 'revenue' ? 'Actual Revenue' : 'Actual Volume',
        line: { color: '#6366f1', width: 2 },
        marker: { size: 4 },
        hovertemplate: `<b>%{x}</b><br>${metric === 'revenue' ? 'Revenue: M%{y:,.0f}' : 'Volume: %{y:,.0f}'}<extra></extra>`
      },
      // 6-month MA
      {
        x: timeSeriesData.labels.slice(timeSeriesData.ma6Start),
        y: timeSeriesData.ma6,
        type: 'scatter',
        mode: 'lines',
        name: '6-Month Moving Average',
        line: { color: '#f59e0b', width: 2.5, dash: 'dot' },
        hovertemplate: `<b>%{x}</b><br>6-Month MA: ${metric === 'revenue' ? 'M%{y:,.0f}' : '%{y:,.0f}'}<extra></extra>`
      },
      // 12-month MA
      {
        x: timeSeriesData.labels.slice(timeSeriesData.ma12Start),
        y: timeSeriesData.ma12,
        type: 'scatter',
        mode: 'lines',
        name: '12-Month Moving Average',
        line: { color: '#ef4444', width: 2.5, dash: 'dash' },
        hovertemplate: `<b>%{x}</b><br>12-Month MA: ${metric === 'revenue' ? 'M%{y:,.0f}' : '%{y:,.0f}'}<extra></extra>`
      }
    ];

    const layout = {
      title: {
        text: `${metric === 'revenue' ? 'Sales Revenue' : 'Sales Volume'} Trend with Moving Averages`,
        font: { size: 20, color: '#1f2937' }
      },
      xaxis: {
        title: 'Period',
        tickangle: -45,
        gridcolor: '#e5e7eb'
      },
      yaxis: {
        title: metric === 'revenue' ? 'Revenue (M)' : 'Sales Volume',
        gridcolor: '#e5e7eb'
      },
      plot_bgcolor: '#f9fafb',
      paper_bgcolor: '#ffffff',
      hovermode: 'x unified',
      showlegend: true,
      legend: {
        orientation: 'h',
        y: -0.15,
        x: 0.5,
        xanchor: 'center'
      },
      margin: { t: 80, b: 100, l: 80, r: 40 }
    };

    console.log('Plotting to:', targetId);
    Plotly.newPlot(targetId, traces, layout, { responsive: true });
    console.log('Chart plotted successfully');
  },

  // Add volume comparison chart (convenience method)
  createVolumeComparisonChart: (data, targetId = 'chart') => {
    return chartUtils.createComparativeAnalysisChart(data, 'volume', targetId);
  }
};

export default chartUtils;