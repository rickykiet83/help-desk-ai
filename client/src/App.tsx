import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

type HealthStatus = "loading" | "ok" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("loading");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, []);

  const statusDisplay: Record<HealthStatus, { label: string; color: string }> = {
    loading: { label: "Checking server...", color: "text-gray-400" },
    ok: { label: "Server is up", color: "text-green-500" },
    error: { label: "Server is unreachable", color: "text-red-500" },
  };

  const { label, color } = statusDisplay[status];

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900">Helpdesk</h1>
                <p className="mt-2 text-gray-500">AI-powered ticket management</p>
                <p className={`mt-4 text-sm font-medium ${color}`}>{label}</p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
