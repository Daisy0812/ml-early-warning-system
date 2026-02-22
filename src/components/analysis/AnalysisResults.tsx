import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Clock,
  Download,
  Share2,
} from "lucide-react";
import { mockProjects, mockAnalyses, Project, Analysis, getRiskColor, getRiskBgColor } from "../../utils/mockData";
import RiskGauge from "../charts/RiskGauge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalysisResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    // Load project and analysis data
    const foundProject = mockProjects.find((p) => p.id === id);
    if (!foundProject) {
      navigate("/dashboard");
      return;
    }
    setProject(foundProject);

    // Load latest analysis
    const latestAnalysis = mockAnalyses.find((a) => a.projectId === id);
    setAnalysis(latestAnalysis || null);
  }, [id, navigate]);

  if (!project || !analysis) {
    return null;
  }

  // Mock historical risk data for trend chart
  const riskTrendData = [
    { date: "Week 1", risk: 32, commits: 45 },
    { date: "Week 2", risk: 38, commits: 52 },
    { date: "Week 3", risk: 45, commits: 38 },
    { date: "Week 4", risk: 52, commits: 31 },
    { date: "Week 5", risk: 61, commits: 28 },
    { date: "Week 6", risk: 72, commits: 19 },
    { date: "Week 7", risk: 78, commits: 15 },
  ];

  const featureImportanceData = analysis.featureImportance.map((f) => ({
    name: f.feature.replace(" ", "\n"),
    importance: f.importance * 100,
  }));

  const handleExport = () => {
    const reportData = {
      project: project.name,
      analysisDate: new Date(analysis.timestamp).toLocaleString(),
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      warnings: analysis.warnings,
      metrics: analysis.metrics,
      recommendations: analysis.recommendations,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "_")}_analysis_report.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/project/${id}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ML Risk Analysis Report</h1>
                <p className="text-sm text-slate-600">{project.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alert Banner */}
        {analysis.riskLevel === "high" && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">High Risk Detected</h3>
                <p className="text-red-800 mb-4">
                  This project shows strong indicators of potential failure. Immediate action is required to prevent
                  project abandonment or significant delays.
                </p>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-900">
                      <strong>Risk Score:</strong> {analysis.riskScore}%
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-900">
                      <strong>Warnings:</strong> {analysis.warnings.length} active
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-900">
                      <strong>Analysis Date:</strong> {new Date(analysis.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">ML-Based Risk Assessment</h2>
                <p className="text-sm text-slate-600">Powered by Random Forest & XGBoost Models</p>
              </div>
            </div>
            <RiskGauge score={analysis.riskScore} />
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-600 mb-1">Prediction Confidence</p>
                <p className="text-2xl font-bold text-slate-900">94%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-600 mb-1">Model Accuracy</p>
                <p className="text-2xl font-bold text-slate-900">91.3%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-600 mb-1">Data Points Used</p>
                <p className="text-2xl font-bold text-slate-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Analysis Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Risk Level</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBgColor(
                      analysis.riskLevel
                    )} ${getRiskColor(analysis.riskLevel)}`}
                  >
                    {analysis.riskLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Active Warnings</span>
                  <span className="font-semibold text-slate-900">{analysis.warnings.length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Recommendations</span>
                  <span className="font-semibold text-slate-900">{analysis.recommendations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Analysis Time</span>
                  <span className="font-semibold text-slate-900">1.2s</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Generated on:</span>
                </div>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(analysis.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Trend Analysis</h2>
          <p className="text-sm text-slate-600 mb-6">
            Historical comparison showing how risk evolved over time
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: "Risk Score (%)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Commits", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} name="Risk Score" />
              <Line yAxisId="right" type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={2} name="Commits" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Explainable AI - Feature Importance */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Explainable AI - Feature Importance</h2>
              <p className="text-sm text-slate-600">Understanding why the model predicted this risk level</p>
            </div>
          </div>

          <div className="mb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureImportanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: "Importance (%)", position: "insideBottom", offset: -5 }} />
                <YAxis type="category" dataKey="name" width={150} />
                <Tooltip />
                <Bar dataKey="importance" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {analysis.featureImportance.map((feature, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{feature.feature}</span>
                    {feature.trend === "increasing" && (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">Increasing</span>
                      </div>
                    )}
                    {feature.trend === "decreasing" && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs">Decreasing</span>
                      </div>
                    )}
                    {feature.trend === "stable" && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs">Stable</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {feature.feature === "Contributor Activity" &&
                    "Measures the engagement level and participation rate of project contributors"}
                  {feature.feature === "Open Issues Ratio" &&
                    "Proportion of unresolved issues compared to total issues - higher ratio indicates problems"}
                  {feature.feature === "Issue Resolution Time" &&
                    "Average time taken to close issues - longer times suggest workflow inefficiencies"}
                  {feature.feature === "Code Churn" &&
                    "Amount of code being added, modified, or deleted - high churn can indicate instability"}
                  {feature.feature === "Commit Frequency" &&
                    "How often commits are being made to the repository - declining frequency is a warning sign"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Detected Warning Signs ({analysis.warnings.length})
              </h2>
            </div>
            <div className="space-y-3">
              {analysis.warnings.map((warning, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 mb-1">Warning #{index + 1}</p>
                    <p className="text-sm text-red-800">{warning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Development Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Metrics Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Commit Frequency</span>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {analysis.metrics.commitFrequency.toFixed(1)}
              </p>
              <p className="text-sm text-slate-600">commits per day</p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-slate-600">
                  {analysis.metrics.commitFrequency < 3
                    ? "⚠️ Below healthy threshold (3+ per day)"
                    : "✓ Within healthy range"}
                </p>
              </div>
            </div>

            <div className="p-5 border-2 border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Contributor Activity</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {analysis.metrics.contributorActivity}%
              </p>
              <p className="text-sm text-slate-600">activity level</p>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-slate-600">
                  {analysis.metrics.contributorActivity < 50
                    ? "⚠️ Low contributor engagement"
                    : analysis.metrics.contributorActivity < 70
                    ? "⚠️ Moderate engagement"
                    : "✓ High engagement level"}
                </p>
              </div>
            </div>

            <div className="p-5 border-2 border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Avg Resolution Time</span>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {analysis.metrics.issueResolutionTime.toFixed(1)}
              </p>
              <p className="text-sm text-slate-600">days</p>
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="text-xs text-slate-600">
                  {analysis.metrics.issueResolutionTime > 10
                    ? "⚠️ Significantly delayed"
                    : analysis.metrics.issueResolutionTime > 7
                    ? "⚠️ Slightly elevated"
                    : "✓ Within acceptable range"}
                </p>
              </div>
            </div>

            <div className="p-5 border-2 border-purple-200 rounded-lg bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Code Churn</span>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{analysis.metrics.codeChurn}</p>
              <p className="text-sm text-slate-600">lines changed/day</p>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <p className="text-xs text-slate-600">
                  {analysis.metrics.codeChurn > 400
                    ? "⚠️ High instability risk"
                    : analysis.metrics.codeChurn > 250
                    ? "⚠️ Moderate churn"
                    : "✓ Stable code changes"}
                </p>
              </div>
            </div>

            <div className="p-5 border-2 border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Open Issues Ratio</span>
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">
                {(analysis.metrics.openIssuesRatio * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-slate-600">of total issues</p>
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-xs text-slate-600">
                  {analysis.metrics.openIssuesRatio > 0.3
                    ? "⚠️ Too many unresolved issues"
                    : analysis.metrics.openIssuesRatio > 0.2
                    ? "⚠️ Moderately high"
                    : "✓ Good issue management"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Corrective Actions & Recovery Strategies
              </h2>
              <p className="text-sm text-slate-600">
                Evidence-based recommendations to reduce risk and improve project health
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {analysis.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="p-5 bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium mb-2">{recommendation}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="px-2 py-1 bg-white rounded-full">Priority: High</span>
                      <span className="px-2 py-1 bg-white rounded-full">
                        Impact: {index < 2 ? "Critical" : index < 4 ? "High" : "Medium"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700">
              <strong>Note:</strong> These recommendations are generated based on industry best practices and
              analysis of thousands of successful software projects. Implementation should be adapted to your team's
              specific context and constraints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
