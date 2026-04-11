import { signOut, useSession } from '../lib/auth-client';

import { Link, useNavigate } from "react-router-dom";

export function NavBar() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-lg font-semibold text-gray-900">Helpdesk</span>
        {session?.user.role === "admin" && (
          <Link to="/users" className="text-sm text-gray-600 hover:text-gray-900">
            Users
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{session?.user.name}</span>
        <button
          onClick={handleSignOut}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
