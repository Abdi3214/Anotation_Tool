"use client";

import {
  Download,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  SaveAll,
  UserPen,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "../../context/UserContext";

export default function HomeLayout({ children }) {
  const router = useRouter();
  const { user } = useStore();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapsed = () => setCollapsed((c) => !c);
  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      router.push("/login");
      return;
    }

    const currentRole = currentUser.userType;
    setRole(currentRole);

    const adminOnlyRoutes = ["/home/dashboard", "/home/export", "/home/users"];
    if (currentRole !== "Admin" && adminOnlyRoutes.includes(pathname)) {
      router.push("/home/annotation");
    }
  }, [user, pathname]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 mt-4 mb-10">
      <div className="flex flex-col">
        {/* Header */}
        <header className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Annotation Tool
            </h1>
            <button
              className="md:hidden text-gray-600 dark:text-gray-300"
              onClick={toggleCollapsed}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
          </div>

          {/* Top Navigation */}
          <nav>
            <ul className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6">
              {role === "Admin" && (
                <li>
                  <Link
                    href="/home/dashboard"
                    className={`text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium ${
                      isActive("/home/dashboard")
                        ? "underline font-semibold"
                        : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/home/profile"
                  className={`text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium ${
                    isActive("/home/profile") ? "underline font-semibold" : ""
                  }`}
                >
                  Profile
                </Link>
              </li>
              {role === "Admin" && (
                <li>
                  <Link
                    href="/home/export"
                    className={`text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium ${
                      isActive("/home/export") ? "underline font-semibold" : ""
                    }`}
                  >
                    Export
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </header>

        {/* Main Layout */}
        <section className="container mx-auto space-y-6 mt-4 mb-10">
          <aside className="w-full border border-gray-200 rounded-lg dark:border-[#0a0a0a] shadow-md flex overflow-hidden">
            {/* Sidebar */}
            <div
              className={`${
                collapsed ? "hidden" : "block"
              } md:block w-16 md:w-60 space-y-5 p-3 border-r border-r-gray-200 dark:border-r-[#0a0a0a] rounded-tr-3xl transition-all duration-300`}
            >
              {role === "Admin" && (
                <>
                  <Link
                    href="/home/dashboard"
                    className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md mt-5 ${
                      isActive("/home/dashboard")
                        ? "bg-gray-100 dark:bg-gray-900 rounded-md font-semibold"
                        : ""
                    }`}
                    title="Dashboard"
                  >
                    <LayoutDashboard />
                    <span className="ml-3 hidden md:inline text-xl">
                      Dashboard
                    </span>
                  </Link>

                  <Link
                    href="/home/users"
                    className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md mt-5 ${
                      isActive("/home/users")
                        ? "bg-gray-100 dark:bg-gray-900 rounded-md font-semibold"
                        : ""
                    }`}
                    title="Users"
                  >
                    <UsersRound />
                    <span className="ml-3 hidden md:inline text-xl">Users</span>
                  </Link>
                </>
              )}

              <Link
                href="/home/annotation"
                className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md ${
                  isActive("/home/annotation")
                    ? "bg-gray-100 dark:bg-gray-900 rounded-md font-semibold"
                    : ""
                }`}
                title="My Annotations"
              >
                <NotebookPen />
                <span className="ml-3 hidden md:inline">My Annotations</span>
              </Link>

              <Link
                href="/home/savedPage"
                className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md ${
                  isActive("/home/savedPage")
                    ? "bg-gray-100 dark:bg-gray-900 rounded-md font-semibold"
                    : ""
                }`}
                title="Saved Annotations"
              >
                <SaveAll />
                <span className="ml-3 hidden md:inline">Saved Annotations</span>
              </Link>

              {role === "Admin" && (
                <Link
                  href="/home/export"
                  className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md ${
                    isActive("/home/export")
                      ? "bg-gray-100 dark:bg-gray-900 rounded-md font-semibold"
                      : ""
                  }`}
                  title="Export"
                >
                  <Download />
                  <span className="ml-3 hidden md:inline">Export</span>
                </Link>
              )}

              <Link
                href="/home/profile"
                className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md ${
                  isActive("/home/profile")
                    ? "bg-gray-100 dark:bg-gray-900 rounded-md font-semibold"
                    : ""
                }`}
                title="Profile"
              >
                <UserPen />
                <span className="ml-3 hidden md:inline">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800 hover:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut />
                <span className="ml-3 hidden md:inline">Log Out</span>
              </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 overflow-x-auto">
              {children}
            </main>
          </aside>
        </section>
      </div>
    </div>
  );
}
