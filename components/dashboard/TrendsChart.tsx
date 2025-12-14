/**
 * Trends Chart Component
 * Displays review trends over time
 */

'use client';

interface Trend {
  period: string;
  count: number;
  averageRating: number;
}

interface TrendsChartProps {
  trends: Trend[];
}

export default function TrendsChart({ trends }: TrendsChartProps) {
  const maxCount = Math.max(...trends.map(t => t.count));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Review Trends</h2>
      
      <div className="space-y-4">
        {trends.map((trend) => (
          <div key={trend.period} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{trend.period}</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{trend.count} reviews</span>
                <span className="flex items-center gap-1 text-yellow-600 font-medium">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {trend.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
            
            {/* Bar */}
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(trend.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
