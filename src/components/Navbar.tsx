"use client";

import { useAdmin } from "@/context/AdminContext";

export const Navbar = () => {
  const { isAdmin, loading } = useAdmin();

  return (
    <nav className="flex justify-between items-center px-4 py-3 border-b">
      <div className="text-lg font-semibold">ONAGUI</div>

      <div className="flex items-center gap-3">
        {loading ? (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md">
            Checking…
          </span>
        ) : isAdmin ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
            Admin
          </span>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;