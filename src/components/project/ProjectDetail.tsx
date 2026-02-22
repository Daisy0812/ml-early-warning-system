import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  GitCommit,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
} from "lucide-react";
import { mockProjects, mockAnalyses, Project, Analysis, getRiskColor, getRiskBgColor } from "../../utils/mockData";
import RiskGauge from "../charts/RiskGauge";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    // Load project data
    const foundProject = mockProjects.find((p) => p.id === id);
    if (!foundProject) {
      navigate("/dashboard");
      return;
    }
    setProject(foundProject);

    // Load analyses for this project
    const projectAnalyses = mockAnalyses.filter((a) => a.projectId === id);
    setAnalyses(projectAnalyses);
  }, [id, navigate]);

  if (!project) {
    return null;
  }

  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-sm text-slate-600">{project.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBgColor(
                  project.riskLevel
                )} ${getRiskColor(project.riskLevel)}`}
              >
                {project.riskLevel.toUpperCase()} RISK
              </span>
              <button
                onClick={() => navigate(`/analysis/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Full Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Risk Score</h2>
            <RiskGauge score={project.riskScore} />
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                Last analyzed: {new Date(project.lastAnalyzed).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Project Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Contributors</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{project.contributors}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <GitCommit className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-600">Total Commits</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{project.commits}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-slate-600">Open Issues</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{project.openIssues}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Closed Issues</span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{project.closedIssues}</p>
              </div>
            </div>

            {project.repository && (
              <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Repository</p>
                <p className="text-sm font-medium text-slate-900 truncate">{project.repository}</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Analysis Summary */}
        {latestAnalysis && (
          <>
            {/* Warnings */}
            {latestAnalysis.warnings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Warnings</h2>
                <div className="space-y-3">
                  {latestAnalysis.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-800">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Importance */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Risk Factors (Explainable AI)
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                These factors contributed most to the current risk assessment:
              </p>
              <div className="space-y-4">
                {latestAnalysis.featureImportance.map((feature, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{feature.feature}</span>
                        {feature.trend === "increasing" && (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        )}
                        {feature.trend === "decreasing" && (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        )}
                        {feature.trend === "stable" && (
                          <Activity className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <span className="text-sm text-slate-600">
                        {(feature.importance * 100).toFixed(0)}% importance
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          feature.importance > 0.25
                            ? "bg-red-500"
                            : feature.importance > 0.15
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${feature.importance * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Development Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Commit Frequency</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {latestAnalysis.metrics.commitFrequency.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">per day</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-slate-600">Contributor Activity</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {latestAnalysis.metrics.contributorActivity}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">activity level</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-slate-600">Avg Resolution Time</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {latestAnalysis.metrics.issueResolutionTime.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">days</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-slate-600">Code Churn</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {latestAnalysis.metrics.codeChurn}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">lines changed</p>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-slate-600">Open Issues Ratio</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {(latestAnalysis.metrics.openIssuesRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">of total issues</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Corrective Actions & Recommendations
              </h2>
              <div className="space-y-3">
                {latestAnalysis.recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
                  >
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm text-slate-800 flex-1">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Historical Analysis */}
        {analyses.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Analysis History</h2>
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/analysis/${analysis.projectId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {new Date(analysis.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">
                        {analysis.warnings.length} warning{analysis.warnings.length !== 1 ? "s" : ""} detected
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{analysis.riskScore}%</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getRiskBgColor(
                          analysis.riskLevel
                        )} ${getRiskColor(analysis.riskLevel)}`}
                      >
                        {analysis.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
