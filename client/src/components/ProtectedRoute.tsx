import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "../lib/auth-client";

export function ProtectedRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="loading"></div>;
  }

  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
