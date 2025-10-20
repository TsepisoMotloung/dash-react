import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { dataUtils } from '../utils/dataUtils';
import { calculationUtils } from '../utils/ calculationUtils';

const ComparisonCard = ({ title, current, previous, growth, periodLabel }) => {
  const isPositive = growth > 0;
  const isNeutral = growth === 0;
  
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
      isPositive ? 'border-green-500' : isNeutral ? 'border-gray-500' : 'border-red-500'
    }`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Current</p>
          <p className="text-2xl font-bold text-gray-900">
            {dataUtils.formatCurrency(current)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Previous</p>
          <p className="text-2xl font-bold text-gray-900">
            {dataUtils.formatCurrency(previous)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-green-500" />
        ) : isNeutral ? (
          <ArrowRight className="w-5 h-5 text-gray-500" />
        ) : (
          <TrendingDown className="w-5 h-5 text-red-500" />
        )}
        <span className={`text-lg font-semibold ${
          isPositive ? 'text-green-600' : 
          isNeutral ? 'text-gray-600' : 'text-red-600'
        }`}>
          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
        </span>
        <span className="text-sm text-gray-500 ml-2">{periodLabel}</span>
      </div>
    </div>
  );
};

const ComparisonMetricsCards = ({ data, currentDate }) => {
  if (!data || data.length === 0 || !currentDate) return null;

  // Get comparisons for different periods
  const comparisons = ['mom', 'qoq', 'yoy', 'ytd'].map(type => 
    calculationUtils.calculatePeriodComparison(data, currentDate, type)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {comparisons.map((comparison, idx) => (
        <div key={idx} className="space-y-6">
          <ComparisonCard
            title="Revenue Growth"
            current={comparison.current.revenue}
            previous={comparison.previous.revenue}
            growth={comparison.growth.revenue}
            periodLabel={comparison.periodLabel}
          />
          <ComparisonCard
            title="Volume Growth"
            current={comparison.current.volume}
            previous={comparison.previous.volume}
            growth={comparison.growth.volume}
            periodLabel={comparison.periodLabel}
          />
        </div>
      ))}
    </div>
  );
};

export default ComparisonMetricsCards;