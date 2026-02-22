interface RiskDistributionChartProps {
  distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export default function RiskDistributionChart({ distribution }: RiskDistributionChartProps) {
  const total = distribution.low + distribution.medium + distribution.high;
  
  const lowPercent = total > 0 ? (distribution.low / total) * 100 : 0;
  const mediumPercent = total > 0 ? (distribution.medium / total) * 100 : 0;
  const highPercent = total > 0 ? (distribution.high / total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Low Risk</span>
            <span className="text-sm font-semibold text-slate-900">{distribution.low} ({lowPercent.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${lowPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Medium Risk</span>
            <span className="text-sm font-semibold text-slate-900">{distribution.medium} ({mediumPercent.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${mediumPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">High Risk</span>
            <span className="text-sm font-semibold text-slate-900">{distribution.high} ({highPercent.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${highPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Total Projects</span>
          <span className="font-semibold text-slate-900">{total}</span>
        </div>
      </div>
    </div>
  );
}
