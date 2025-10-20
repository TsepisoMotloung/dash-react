import React from 'react';
import {dataUtils} from '../utils/dataUtils';
import { Lock, UserCheck, Filter, LogOut, Download, TrendingUp, Users, DollarSign, Package } from 'lucide-react';


// ============= METRICS CARDS COMPONENT =============
const MetricsCards = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 ${dataUtils.getGrowthBgColor(metrics.revenueGrowth)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <DollarSign className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {dataUtils.formatCurrency(metrics.totalRevenue)}
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${dataUtils.getGrowthColor(metrics.revenueGrowth)}`}>
            {dataUtils.getGrowthIcon(metrics.revenueGrowth)} {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">vs previous period</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Sales Growth</h3>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {metrics.growth > 0 ? '+' : ''}{metrics.growth.toFixed(1)}%
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${dataUtils.getGrowthColor(metrics.growth)}`}>
            {dataUtils.getGrowthIcon(metrics.growth)} Monthly
          </span>
        </div>
      </div>

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
            {dataUtils.formatCurrency(metrics.topProductRevenue)} revenue
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Sales Volume</h3>
          <Package className="w-8 h-8 text-teal-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {metrics.totalVolume}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Units sold</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Avg Revenue / Sale</h3>
          <DollarSign className="w-8 h-8 text-indigo-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {dataUtils.formatCurrency(metrics.avgRevenuePerUnit)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Per unit on average</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Top Sales Agent</h3>
          <Users className="w-8 h-8 text-pink-500" />
        </div>
        <p className="text-xl font-bold text-gray-900 mb-2 truncate">
          {metrics.topAgent}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{dataUtils.formatCurrency(metrics.topAgentRevenue)} • {metrics.topAgentVolume} units</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;