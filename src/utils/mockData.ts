// Mock data for demonstration purposes
export interface Project {
  id: string;
  name: string;
  description: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  lastAnalyzed: string;
  repository?: string;
  contributors: number;
  commits: number;
  openIssues: number;
  closedIssues: number;
  createdAt: string;
}

export interface Analysis {
  id: string;
  projectId: string;
  projectName: string;
  timestamp: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  warnings: string[];
  featureImportance: {
    feature: string;
    importance: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
  metrics: {
    commitFrequency: number;
    contributorActivity: number;
    issueResolutionTime: number;
    codeChurn: number;
    openIssuesRatio: number;
  };
  recommendations: string[];
}

export interface Warning {
  id: string;
  projectId: string;
  projectName: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-Commerce Platform",
    description: "Full-stack online shopping application with payment integration",
    riskScore: 78,
    riskLevel: "high",
    lastAnalyzed: "2026-02-09T10:30:00",
    repository: "github.com/user/ecommerce-platform",
    contributors: 3,
    commits: 156,
    openIssues: 23,
    closedIssues: 45,
    createdAt: "2025-11-15",
  },
  {
    id: "2",
    name: "Mobile Task Manager",
    description: "Cross-platform task management application",
    riskScore: 45,
    riskLevel: "medium",
    lastAnalyzed: "2026-02-08T15:20:00",
    repository: "github.com/user/task-manager",
    contributors: 5,
    commits: 289,
    openIssues: 8,
    closedIssues: 102,
    createdAt: "2025-09-20",
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    description: "Real-time data visualization and analytics platform",
    riskScore: 22,
    riskLevel: "low",
    lastAnalyzed: "2026-02-09T09:15:00",
    repository: "github.com/user/analytics-dashboard",
    contributors: 7,
    commits: 421,
    openIssues: 3,
    closedIssues: 156,
    createdAt: "2025-08-05",
  },
  {
    id: "4",
    name: "Chat Application",
    description: "Real-time messaging platform with WebSocket support",
    riskScore: 65,
    riskLevel: "medium",
    lastAnalyzed: "2026-02-07T14:45:00",
    repository: "github.com/user/chat-app",
    contributors: 2,
    commits: 98,
    openIssues: 15,
    closedIssues: 28,
    createdAt: "2025-12-10",
  },
  {
    id: "5",
    name: "Blog CMS",
    description: "Content management system for blogging",
    riskScore: 18,
    riskLevel: "low",
    lastAnalyzed: "2026-02-09T08:00:00",
    contributors: 4,
    commits: 312,
    openIssues: 2,
    closedIssues: 98,
    createdAt: "2025-07-22",
  },
];

export const mockWarnings: Warning[] = [
  {
    id: "w1",
    projectId: "1",
    projectName: "E-Commerce Platform",
    severity: "critical",
    message: "Declining contributor activity detected - 60% reduction in past 2 weeks",
    timestamp: "2026-02-09T10:30:00",
    acknowledged: false,
  },
  {
    id: "w2",
    projectId: "1",
    projectName: "E-Commerce Platform",
    severity: "high",
    message: "Increasing number of unresolved issues - 23 open vs 45 closed",
    timestamp: "2026-02-09T10:30:00",
    acknowledged: false,
  },
  {
    id: "w3",
    projectId: "4",
    projectName: "Chat Application",
    severity: "medium",
    message: "Average issue resolution time increasing - now 12.5 days vs 7 days baseline",
    timestamp: "2026-02-07T14:45:00",
    acknowledged: true,
  },
  {
    id: "w4",
    projectId: "2",
    projectName: "Mobile Task Manager",
    severity: "medium",
    message: "Code churn rate elevated - potential instability in recent commits",
    timestamp: "2026-02-08T15:20:00",
    acknowledged: false,
  },
];

export const mockAnalyses: Analysis[] = [
  {
    id: "a1",
    projectId: "1",
    projectName: "E-Commerce Platform",
    timestamp: "2026-02-09T10:30:00",
    riskScore: 78,
    riskLevel: "high",
    warnings: [
      "Declining contributor activity detected",
      "Increasing number of unresolved issues",
      "Delayed bug resolution times",
    ],
    featureImportance: [
      { feature: "Contributor Activity", importance: 0.35, trend: "decreasing" },
      { feature: "Open Issues Ratio", importance: 0.28, trend: "increasing" },
      { feature: "Issue Resolution Time", importance: 0.22, trend: "increasing" },
      { feature: "Code Churn", importance: 0.10, trend: "stable" },
      { feature: "Commit Frequency", importance: 0.05, trend: "decreasing" },
    ],
    metrics: {
      commitFrequency: 2.3,
      contributorActivity: 40,
      issueResolutionTime: 15.2,
      codeChurn: 234,
      openIssuesRatio: 0.34,
    },
    recommendations: [
      "Increase team collaboration through daily standups or weekly syncs",
      "Prioritize and address the 23 open issues - consider triage meeting",
      "Review and optimize the bug resolution workflow to reduce average time",
      "Consider bringing in additional contributors or redistributing workload",
      "Implement automated testing to improve code stability",
    ],
  },
  {
    id: "a2",
    projectId: "2",
    projectName: "Mobile Task Manager",
    timestamp: "2026-02-08T15:20:00",
    riskScore: 45,
    riskLevel: "medium",
    warnings: [
      "Code churn rate elevated",
      "Moderate commit frequency decline",
    ],
    featureImportance: [
      { feature: "Code Churn", importance: 0.32, trend: "increasing" },
      { feature: "Commit Frequency", importance: 0.26, trend: "decreasing" },
      { feature: "Contributor Activity", importance: 0.20, trend: "stable" },
      { feature: "Issue Resolution Time", importance: 0.12, trend: "stable" },
      { feature: "Open Issues Ratio", importance: 0.10, trend: "stable" },
    ],
    metrics: {
      commitFrequency: 4.1,
      contributorActivity: 72,
      issueResolutionTime: 6.8,
      codeChurn: 456,
      openIssuesRatio: 0.07,
    },
    recommendations: [
      "Monitor code churn - ensure changes are purposeful and well-tested",
      "Maintain current issue management practices - performing well",
      "Consider code review practices to reduce unnecessary changes",
      "Keep contributor engagement stable with regular communication",
    ],
  },
  {
    id: "a3",
    projectId: "3",
    projectName: "Analytics Dashboard",
    timestamp: "2026-02-09T09:15:00",
    riskScore: 22,
    riskLevel: "low",
    warnings: [],
    featureImportance: [
      { feature: "Contributor Activity", importance: 0.30, trend: "stable" },
      { feature: "Commit Frequency", importance: 0.25, trend: "stable" },
      { feature: "Issue Resolution Time", importance: 0.20, trend: "stable" },
      { feature: "Open Issues Ratio", importance: 0.15, trend: "stable" },
      { feature: "Code Churn", importance: 0.10, trend: "stable" },
    ],
    metrics: {
      commitFrequency: 6.7,
      contributorActivity: 88,
      issueResolutionTime: 3.2,
      codeChurn: 189,
      openIssuesRatio: 0.02,
    },
    recommendations: [
      "Project is healthy - maintain current development practices",
      "Continue regular contributions and active issue management",
      "Consider this project as a best-practice reference for other projects",
      "Document successful workflows for team knowledge sharing",
    ],
  },
];

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "text-green-600";
    case "medium":
      return "text-yellow-600";
    case "high":
      return "text-red-600";
    case "critical":
      return "text-red-700";
    default:
      return "text-slate-600";
  }
}

export function getRiskBgColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "bg-green-100";
    case "medium":
      return "bg-yellow-100";
    case "high":
      return "bg-red-100";
    case "critical":
      return "bg-red-200";
    default:
      return "bg-slate-100";
  }
}

export function getRiskBorderColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "border-green-300";
    case "medium":
      return "border-yellow-300";
    case "high":
      return "border-red-300";
    case "critical":
      return "border-red-400";
    default:
      return "border-slate-300";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
