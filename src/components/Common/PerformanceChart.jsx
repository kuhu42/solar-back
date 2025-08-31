import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const PerformanceChart = ({ title, data = [], type = 'bar', showTrend = true }) => {
  // Mock data for 12 months
  const mockMonthlyData = [
    { month: 'Jan', value: 45, leads: 12, conversions: 8 },
    { month: 'Feb', value: 52, leads: 15, conversions: 10 },
    { month: 'Mar', value: 48, leads: 18, conversions: 12 },
    { month: 'Apr', value: 61, leads: 22, conversions: 15 },
    { month: 'May', value: 55, leads: 20, conversions: 14 },
    { month: 'Jun', value: 67, leads: 25, conversions: 18 },
    { month: 'Jul', value: 59, leads: 28, conversions: 19 },
    { month: 'Aug', value: 72, leads: 30, conversions: 22 },
    { month: 'Sep', value: 68, leads: 26, conversions: 20 },
    { month: 'Oct', value: 75, leads: 32, conversions: 24 },
    { month: 'Nov', value: 71, leads: 29, conversions: 21 },
    { month: 'Dec', value: 78, leads: 35, conversions: 26 }
  ];

  const chartData = data.length > 0 ? data : mockMonthlyData;
  const maxValue = Math.max(...chartData.map(d => d.value));
  const trend = chartData[chartData.length - 1].value > chartData[0].value;
  const trendPercentage = Math.round(((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showTrend && (
            <div className="flex items-center mt-1">
              {trend ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trendPercentage)}% {trend ? 'increase' : 'decrease'}
              </span>
            </div>
          )}
        </div>
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>

      {/* Chart */}
      <div className="h-64">
        {type === 'bar' ? (
          <div className="flex items-end justify-between h-full space-x-1">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center h-48">
                  <div
                    className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(item.value / maxValue) * 100}%` }}
                    title={`${item.month}: ${item.value}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-full">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="400"
                  y2={i * 40}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              ))}
              
              {/* Line chart */}
              <polyline
                fill="url(#gradient)"
                stroke="#3B82F6"
                strokeWidth="2"
                points={chartData.map((item, index) => 
                  `${(index / (chartData.length - 1)) * 400},${200 - (item.value / maxValue) * 180}`
                ).join(' ')}
              />
              
              {/* Data points */}
              {chartData.map((item, index) => (
                <circle
                  key={index}
                  cx={(index / (chartData.length - 1)) * 400}
                  cy={200 - (item.value / maxValue) * 180}
                  r="4"
                  fill="#3B82F6"
                  className="hover:r-6 transition-all"
                />
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Legend/Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.value, 0)}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}
            </p>
            <p className="text-sm text-gray-600">Average</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(...chartData.map(d => d.value))}
            </p>
            <p className="text-sm text-gray-600">Peak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;