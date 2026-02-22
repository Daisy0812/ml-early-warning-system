import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Plus,
  LogOut,
  User,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Search
} from "lucide-react";
import { mockProjects, mockWarnings, Project, Warning, getRiskColor, getRiskBgColor, formatDate } from "../../utils/mockData";
import RiskGauge from "../charts/RiskGauge";
import RiskDistributionChart from "../charts/RiskDistributionChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
    
    // Load mock data
    setProjects(mockProjects);
    setWarnings(mockWarnings);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unacknowledgedWarnings = warnings.filter(w => !w.acknowledged);
  const criticalWarnings = warnings.filter(w => w.severity === "critical" || w.severity === "high");

  const riskDistribution = {
    low: projects.filter(p => p.riskLevel === "low").length,
    medium: projects.filter(p => p.riskLevel === "medium").length,
    high: projects.filter(p => p.riskLevel === "high").length,
  };

  const averageRiskScore = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.riskScore, 0) / projects.length)
    : 0;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Early Warning System</h1>
                  <p className="text-sm text-slate-600">ML-Based Project Monitoring</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{user.username}</span>
                <span className="text-xs text-slate-500 ml-2 px-2 py-0.5 bg-white rounded">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Warnings Banner */}
        {criticalWarnings.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {criticalWarnings.length} Critical Warning{criticalWarnings.length !== 1 ? 's' : ''} Require Attention
                </h3>
                <p className="text-sm text-red-700">
                  High-risk patterns detected in your projects. Review and take action immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-slate-600">Avg</span>
            </div>
            <p className="text-sm text-slate-600 mb-1">Average Risk Score</p>
            <p className="text-3xl font-bold text-slate-900">{averageRiskScore}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              {unacknowledgedWarnings.length > 0 ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <p className="text-sm text-slate-600 mb-1">Active Warnings</p>
            <p className="text-3xl font-bold text-slate-900">{unacknowledgedWarnings.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 mb-1">Healthy Projects</p>
            <p className="text-3xl font-bold text-slate-900">{riskDistribution.low}</p>
          </div>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Overall Risk Level</h2>
            <RiskGauge score={averageRiskScore} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Distribution</h2>
            <RiskDistributionChart distribution={riskDistribution} />
          </div>
        </div>

        {/* Recent Warnings */}
        {warnings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Warnings</h2>
            <div className="space-y-3">
              {warnings.slice(0, 5).map((warning) => (
                <div
                  key={warning.id}
                  className={`p-4 rounded-lg border ${
                    warning.severity === "critical" ? "bg-red-50 border-red-200" :
                    warning.severity === "high" ? "bg-orange-50 border-orange-200" :
                    warning.severity === "medium" ? "bg-yellow-50 border-yellow-200" :
                    "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          warning.severity === "critical" ? "text-red-600" :
                          warning.severity === "high" ? "text-orange-600" :
                          warning.severity === "medium" ? "text-yellow-600" :
                          "text-blue-600"
                        }`} />
                        <span className="font-medium text-slate-900">{warning.projectName}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          warning.severity === "critical" ? "bg-red-200 text-red-800" :
                          warning.severity === "high" ? "bg-orange-200 text-orange-800" :
                          warning.severity === "medium" ? "bg-yellow-200 text-yellow-800" :
                          "bg-blue-200 text-blue-800"
                        }`}>
                          {warning.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{warning.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(warning.timestamp)}</p>
                    </div>
                    {!warning.acknowledged && (
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Your Projects</h2>
            <button
              onClick={() => navigate("/project/create")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBgColor(project.riskLevel)} ${getRiskColor(project.riskLevel)}`}>
                    {project.riskLevel.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-slate-900">{project.riskScore}%</span>
                  <span className="text-xs text-slate-500">Risk Score</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Contributors</p>
                    <p className="text-sm font-semibold text-slate-900">{project.contributors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Commits</p>
                    <p className="text-sm font-semibold text-slate-900">{project.commits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Issues</p>
                    <p className="text-sm font-semibold text-slate-900">{project.openIssues}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-3 border-t border-slate-100">
                  Last analyzed: {formatDate(project.lastAnalyzed)}
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">
                {searchTerm ? "No projects found matching your search" : "No projects yet"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate("/project/create")}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first project
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
