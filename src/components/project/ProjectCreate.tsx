import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, Github, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner@2.0.3";

export default function ProjectCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repository: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dataPreview, setDataPreview] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    missingFields: string[];
    warnings: string[];
  } | null>(null);

  const requiredFields = [
    "commit_frequency",
    "contributor_count",
    "open_issues",
    "closed_issues",
    "avg_resolution_time",
    "code_churn",
  ];

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      toast.error("Please upload a CSV or JSON file");
      return;
    }

    setUploadedFile(file);
    
    // Simulate file parsing and validation
    setTimeout(() => {
      const mockPreview = {
        fileName: file.name,
        rows: 150,
        columns: 8,
        dateRange: "2025-06-01 to 2026-02-09",
        sampleData: {
          commit_frequency: 4.2,
          contributor_count: 5,
          open_issues: 12,
          closed_issues: 45,
          avg_resolution_time: 7.3,
          code_churn: 234,
        },
      };

      setDataPreview(mockPreview);

      // Validation
      const missing = requiredFields.filter(
        field => !(field in mockPreview.sampleData)
      );

      setValidationStatus({
        valid: missing.length === 0,
        missingFields: missing,
        warnings: mockPreview.rows < 30 ? ["Dataset has less than 30 data points - predictions may be less accurate"] : [],
      });

      if (missing.length === 0) {
        toast.success("Dataset validated successfully!");
      } else {
        toast.error("Dataset is missing required fields");
      }
    }, 1000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleGitHubConnect = () => {
    if (!formData.repository) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    toast.info("Connecting to GitHub...");
    
    // Simulate GitHub API connection
    setTimeout(() => {
      const mockGitHubData = {
        fileName: "GitHub Data: " + formData.repository,
        rows: 180,
        columns: 10,
        dateRange: "2025-05-15 to 2026-02-09",
        sampleData: {
          commit_frequency: 5.8,
          contributor_count: 7,
          open_issues: 8,
          closed_issues: 98,
          avg_resolution_time: 4.2,
          code_churn: 189,
        },
      };

      setDataPreview(mockGitHubData);
      setValidationStatus({
        valid: true,
        missingFields: [],
        warnings: [],
      });

      toast.success("GitHub repository connected successfully!");
    }, 1500);
  };

  const handleCreateProject = () => {
    if (!formData.name) {
      toast.error("Please enter a project name");
      return;
    }

    if (!dataPreview) {
      toast.error("Please upload data or connect a GitHub repository");
      return;
    }

    if (!validationStatus?.valid) {
      toast.error("Please fix validation errors before creating project");
      return;
    }

    toast.success("Project created successfully!");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">Create New Project</h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">Project Info</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Data Source</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Step 1: Project Information */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="E-commerce Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Describe your project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GitHub Repository (Optional)
                </label>
                <input
                  type="text"
                  value={formData.repository}
                  onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Data Source */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Dataset</h2>
              <p className="text-slate-600 mb-6">
                Upload a CSV or JSON file containing your project metrics
              </p>

              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-900 mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-slate-600 mb-4">or</p>
                <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-slate-500 mt-4">
                  Supports: CSV, JSON (Max 10MB)
                </p>
              </div>

              {/* Required Fields Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Required Data Fields:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Commit Frequency</li>
                  <li>• Contributor Count</li>
                  <li>• Open Issues</li>
                  <li>• Closed Issues</li>
                  <li>• Average Resolution Time</li>
                  <li>• Code Churn</li>
                </ul>
              </div>
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500 font-medium">OR</span>
              </div>
            </div>

            {/* GitHub Integration */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect GitHub Repository</h2>
              <p className="text-slate-600 mb-6">
                Automatically fetch metrics from your GitHub repository
              </p>

              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.repository}
                    onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <button
                  onClick={handleGitHubConnect}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  <span>Connect</span>
                </button>
              </div>

              <p className="text-sm text-slate-500 mt-4">
                Note: GitHub integration requires authentication in production
              </p>
            </div>

            {/* Data Preview */}
            {dataPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Data Preview</h2>
                    <p className="text-slate-600">{dataPreview.fileName}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Rows</p>
                    <p className="text-2xl font-bold text-slate-900">{dataPreview.rows}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Columns</p>
                    <p className="text-2xl font-bold text-slate-900">{dataPreview.columns}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg col-span-2">
                    <p className="text-sm text-slate-600 mb-1">Date Range</p>
                    <p className="text-lg font-semibold text-slate-900">{dataPreview.dateRange}</p>
                  </div>
                </div>

                {/* Validation Status */}
                {validationStatus && (
                  <div className={`p-4 rounded-lg border mb-6 ${
                    validationStatus.valid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {validationStatus.valid ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${
                          validationStatus.valid ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {validationStatus.valid ? 'Dataset Valid' : 'Validation Errors'}
                        </h3>
                        {validationStatus.missingFields.length > 0 && (
                          <div className="text-sm text-red-700">
                            <p className="mb-1">Missing required fields:</p>
                            <ul className="list-disc list-inside">
                              {validationStatus.missingFields.map((field) => (
                                <li key={field}>{field}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {validationStatus.warnings.length > 0 && (
                          <div className="text-sm text-yellow-700 mt-2">
                            {validationStatus.warnings.map((warning, i) => (
                              <p key={i}>⚠️ {warning}</p>
                            ))}
                          </div>
                        )}
                        {validationStatus.valid && (
                          <p className="text-sm text-green-700">
                            All required fields present. Ready for analysis.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sample Data */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Sample Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(dataPreview.sampleData).map(([key, value]) => (
                      <div key={key} className="p-3 border border-slate-200 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-lg font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!dataPreview || !validationStatus?.valid}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Create</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Project Details</h3>
                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium text-slate-900">{formData.name}</span>
                  </div>
                  {formData.description && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Description:</span>
                      <span className="font-medium text-slate-900 text-right max-w-md">{formData.description}</span>
                    </div>
                  )}
                  {formData.repository && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Repository:</span>
                      <span className="font-medium text-slate-900">{formData.repository}</span>
                    </div>
                  )}
                </div>
              </div>

              {dataPreview && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Data Source</h3>
                  <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Source:</span>
                      <span className="font-medium text-slate-900">{dataPreview.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Data Points:</span>
                      <span className="font-medium text-slate-900">{dataPreview.rows} rows</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date Range:</span>
                      <span className="font-medium text-slate-900">{dataPreview.dateRange}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> After creating the project, an initial ML analysis will be performed. 
                  This may take a few moments to complete.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
