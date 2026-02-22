import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { AlertCircle, Github, Mail, Linkedin, Lock, User } from "lucide-react";
import { toast } from "sonner@2.0.3";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (formData.username && formData.password) {
        // Mock authentication - store user data
        localStorage.setItem("user", JSON.stringify({
          username: formData.username,
          role: "developer",
          authenticated: true
        }));
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        setError("Please enter both username and password");
        setLoading(false);
      }
    }, 800);
  };

  const handleOAuthLogin = (provider: string) => {
    toast.info(`${provider} authentication would be handled here`);
    // In production, this would redirect to OAuth provider
    // For demo, simulate successful OAuth login
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({
        username: `${provider.toLowerCase()}_user`,
        role: "developer",
        authenticated: true,
        provider: provider
      }));
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Early Warning System
            </h1>
            <p className="text-slate-600">
              ML-Based Project Failure Detection
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin("GitHub")}
              className="w-full py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </button>
            <button
              onClick={() => handleOAuthLogin("Google")}
              className="w-full py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
            >
              <Mail className="w-5 h-5" />
              <span className="font-medium">Google</span>
            </button>
            <button
              onClick={() => handleOAuthLogin("LinkedIn")}
              className="w-full py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-3"
            >
              <Linkedin className="w-5 h-5" />
              <span className="font-medium">LinkedIn</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Secure authentication for project monitoring</p>
        </div>
      </div>
    </div>
  );
}
