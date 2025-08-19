"use client"

import { Download, LayoutDashboard, NotebookPen, SaveAll, Upload, PenIcon as UserPen, UsersRound } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomeLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState(null)
  const [collapsed, setCollapsed] = useState(true)

  const toggleCollapsed = () => setCollapsed((c) => !c)
  const isActive = (href) => pathname === href

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null")

    if (!currentUser) {
      router.push("/")
      return
    }

    const currentRole = currentUser.userType || "User"
    setRole(currentRole)

    const adminOnlyRoutes = ["/dashboard", "/export", "/users"]
    if (currentRole !== "Admin" && adminOnlyRoutes.some((route) => pathname.includes(route))) {
      router.push("/annotation")
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6 pt-4 pb-10">
        <div className="flex flex-col">
          {/* Header */}
          <header className="w-full px-6 py-4 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-blue-500/10 dark:shadow-slate-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center justify-between w-full md:w-auto">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient bg-300">
                Annotation Tool
              </h1>
              <button
                className="md:hidden p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
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
                      href="/dashboard"
                      className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        isActive("/dashboard")
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/profile"
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      isActive("/profile")
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    Profile
                  </Link>
                </li>
                {role === "Admin" && (
                  <li>
                    <Link
                      href="/export"
                      className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        isActive("/export")
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      Export
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => {
                      localStorage.removeItem("user")
                      router.push("/")
                    }}
                    className="px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </header>

          {/* Main Layout */}
          <section className="container mx-auto">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/30 flex overflow-hidden">
              {/* Sidebar */}
              <div
                className={`${
                  collapsed ? "hidden" : "block"
                } md:block w-16 md:w-72 space-y-3 p-6 border-r border-white/20 dark:border-slate-700/50 transition-all duration-500 ease-in-out`}
              >
                {role === "Admin" && (
                  <>
                    <Link
                      href="/home/dashboard"
                      className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isActive("/home/dashboard")
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                      title="Dashboard"
                    >
                      <LayoutDashboard
                        className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-12 ${
                          isActive("/home/dashboard") ? "text-white" : ""
                        }`}
                      />
                      <span className="ml-4 hidden md:inline font-medium">Dashboard</span>
                    </Link>

                    <Link
                      href="/home/users"
                      className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isActive("/home/users")
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                      title="Users"
                    >
                      <UsersRound
                        className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                          isActive("/home/users") ? "text-white" : ""
                        }`}
                      />
                      <span className="ml-4 hidden md:inline font-medium">Users</span>
                    </Link>

                    <Link
                      href="/home/batch"
                      className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        isActive("/home/batch")
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                      title="Upload"
                    >
                      <Upload
                        className={`w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1 ${
                          isActive("/batch") ? "text-white" : ""
                        }`}
                      />
                      <span className="ml-4 hidden md:inline font-medium">Upload</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/home/annotation"
                  className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive("/home/annotation")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                  title="My Annotations"
                >
                  <NotebookPen
                    className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-6 ${
                      isActive("/home/annotation") ? "text-white" : ""
                    }`}
                  />
                  <span className="ml-4 hidden md:inline font-medium">My Annotations</span>
                </Link>

                <Link
                  href="/home/savedPage"
                  className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive("/home/savedPage")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                  title="Saved Annotations"
                >
                  <SaveAll
                    className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                      isActive("/home/saved") ? "text-white" : ""
                    }`}
                  />
                  <span className="ml-4 hidden md:inline font-medium">Saved Annotations</span>
                </Link>

                {role === "Admin" && (
                  <Link
                    href="/home/export"
                    className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                      isActive("/home/export")
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                        : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                    title="Export"
                  >
                    <Download
                      className={`w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1 ${
                        isActive("/export") ? "text-white" : ""
                      }`}
                    />
                    <span className="ml-4 hidden md:inline font-medium">Export</span>
                  </Link>
                )}

                <Link
                  href="/home/profile"
                  className={`group flex items-center w-full p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive("/home/profile")
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                  title="Profile"
                >
                  <UserPen
                    className={`w-6 h-6 transition-transform duration-300 group-hover:rotate-12 ${
                      isActive("/home/profile") ? "text-white" : ""
                    }`}
                  />
                  <span className="ml-4 hidden md:inline font-medium">Profile</span>
                </Link>
              </div>

              {/* Main Content */}
              <main className="flex-1 w-full px-8 py-8 overflow-x-auto bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50">
                <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">{children}</div>
              </main>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
