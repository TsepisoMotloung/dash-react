import Plotly from 'plotly.js-dist';
import { calculationUtils } from './ calculationUtils';

export const chartUtils = {
  /**
   * Create overview bar chart showing monthly revenue
   */
  createOverviewChart: (data) => {
    const monthlyData = calculationUtils.aggregateByMonth(data);
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
  },

  /**
   * Create monthly trend line chart
   */
  createMonthlyChart: (data) => {
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

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  },

  /**
   * Create products bar chart showing top products by revenue
   */
  createProductsChart: (data) => {
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

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  },

  /**
   * Create seasonal analysis chart with revenue and transactions
   */
  createSeasonalChart: (data) => {
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

    Plotly.newPlot('chart', [trace1, trace2], layout, { responsive: true });
  },

  /**
   * Create regional pie chart showing revenue distribution
   */
  createRegionalChart: (data) => {
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

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  },

  /**
   * Create agent performance horizontal bar chart
   */
  createAgentPerformanceChart: (data) => {
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

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  },

  /**
   * Create forecast/distribution histogram
   */
  createForecastChart: (data) => {
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

    Plotly.newPlot('chart', [trace], layout, { responsive: true });
  },

  /**
   * Create comparative analysis chart
   */
  createComparativeAnalysisChart: (data, comparisonMetrics) => {
    if (!comparisonMetrics) {
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
  }
};

export default chartUtils;