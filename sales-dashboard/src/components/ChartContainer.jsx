import React from 'react';
import Plotly from 'plotly.js-dist';
import { chartUtils } from '../utils/chartUtils';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading data...</p>
    </div>
  </div>
);

const NoDataMessage = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <p className="text-gray-600 text-xl">No data available for current filters</p>
      <p className="text-gray-500 text-sm mt-2">Try adjusting your filter settings</p>
    </div>
  </div>
);

const ProcessingMessage = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Processing data...</p>
    </div>
  </div>
);

const ChartContainer = ({ 
  data, 
  filteredData, 
  chartId, 
  height = '600px',
  className = "bg-white rounded-xl shadow-lg p-6" 
}) => {
  React.useEffect(() => {
    if (!filteredData || filteredData.length === 0) return;

    try {
      const element = document.getElementById(chartId);
      if (!element) return;

      // Purge any existing chart
      Plotly.purge(element);

      // Determine which chart to create based on the chartId
      if (chartId === 'revenueChart') {
        chartUtils.createComparativeAnalysisChart(filteredData, 'revenue');
      } else if (chartId === 'volumeChart') {
        chartUtils.createComparativeAnalysisChart(filteredData, 'volume');
      } else if (chartId === 'chart') {
        // Default chart based on active tab will be handled by the parent component
        const tabChartMap = {
          overview: () => chartUtils.createOverviewChart(filteredData),
          monthly: () => chartUtils.createMonthlyChart(filteredData),
          products: () => chartUtils.createProductsChart(filteredData),
          seasonal: () => chartUtils.createSeasonalChart(filteredData),
          regional: () => chartUtils.createRegionalChart(filteredData),
          agents: () => chartUtils.createAgentPerformanceChart(filteredData),
          forecast: () => chartUtils.createForecastChart(filteredData)
        };
        
        // Get the active tab from the URL or parent component state
        const activeTab = window.location.pathname.split('/').pop() || 'overview';
        const chartFunction = tabChartMap[activeTab] || tabChartMap.overview;
        chartFunction();
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
    }
  }, [data, filteredData, chartId]);

  return (
    <div className={className}>
      {!data ? (
        <LoadingSpinner />
      ) : !filteredData ? (
        <ProcessingMessage />
      ) : filteredData.length === 0 ? (
        <NoDataMessage />
      ) : (
        <div id={chartId} className="w-full" style={{ height }}></div>
      )}
    </div>
  );
};

export default ChartContainer;