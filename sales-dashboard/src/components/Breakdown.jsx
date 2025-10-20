import React from 'react';
import { chartUtils } from '../utils/chartUtils';

const Panel = ({ title, id, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-4">
    <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
    <div id={id} style={{ height: 320 }} className="w-full" />
  </div>
);

const Breakdown = ({ filteredData }) => {
  React.useEffect(() => {
    if (!filteredData || filteredData.length === 0) return;

    try {
      // Create each chart in its own container
      chartUtils.createSeasonalChart(filteredData, 'seasonalChart');
      chartUtils.createRegionalChart(filteredData, 'regionalChart');
      chartUtils.createProductsChart(filteredData, 'productsChart');
      chartUtils.createMonthlyChart(filteredData, 'monthlyChart');
    } catch (e) {
      console.error('Error rendering breakdown charts', e);
    }
  }, [filteredData]);

  if (!filteredData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Panel title="Seasonal Trends" id="seasonalChart" />
      <Panel title="Regional Distribution" id="regionalChart" />
      <Panel title="Top Products" id="productsChart" />
      <Panel title="Monthly Trends" id="monthlyChart" />
    </div>
  );
};

export default Breakdown;
