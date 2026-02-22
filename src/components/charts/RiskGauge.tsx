interface RiskGaugeProps {
  score: number;
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: "Low Risk", color: "#10b981" };
    if (score < 60) return { level: "Medium Risk", color: "#f59e0b" };
    return { level: "High Risk", color: "#ef4444" };
  };

  const risk = getRiskLevel(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={risk.color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-slate-900">{score}%</span>
          <span className="text-sm text-slate-600 mt-1">{risk.level}</span>
        </div>
      </div>
    </div>
  );
}
