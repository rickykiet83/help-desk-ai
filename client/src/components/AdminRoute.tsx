import { Navigate, Outlet } from "react-router-dom";
import { Role } from "@helpdesk/core";
import { useSession } from "../lib/auth-client";

export function AdminRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600' />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (session?.user?.role !== Role.admin) return <Navigate to="/" replace />;

  return <Outlet />;
}
