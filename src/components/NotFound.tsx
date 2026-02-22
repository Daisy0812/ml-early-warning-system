import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
        <p className="text-slate-600 mb-6">Page not found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
