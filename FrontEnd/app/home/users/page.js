"use client"
import { Pencil, UserRoundPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check authentication and fetch users
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")

    if (!token || !userStr) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userStr)
    if (user.userType !== "Admin") {
      router.push("/login")
      return
    }

    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:5000/api/users/usersAll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
        return
      }

      const data = await res.json()
      const mapped = data.map((user) => ({
        id: user.Annotator_ID,
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        type: user.userType,
        status: Boolean(user.isActive), // ensures proper Boolean
      }))

      setUsers(mapped)

      if (typeof window !== "undefined") {
        localStorage.setItem("totalUsers", mapped.length)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const TableSkeleton = ({ rows = 6 }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <th key={idx} className="px-4 py-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-[70%] animate-pulse"></div>
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {Array(rows)
            .fill(0)
            .map((_, rowIdx) => (
              <tr key={rowIdx} className="animate-pulse">
                {Array(6)
                  .fill(0)
                  .map((_, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-background via-card/50 to-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Users Management
      </h1>

      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
        {loading ? (
          <TableSkeleton rows={10} />
        ) : (
          <table className="min-w-full text-sm text-left table-auto">
            <thead className="bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">ID</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Name</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Email</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Type</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Edit</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  className="border-t border-border/30 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 text-foreground/80 whitespace-nowrap font-mono text-xs">
                    {user.id || user._id}
                  </td>
                  <td className="px-6 py-4 text-foreground font-medium whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 text-foreground/70 break-words max-w-xs">{user.email}</td>
                  <td className="px-6 py-4 capitalize text-foreground/80 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.type === "Admin" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                      }`}
                    >
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={{
                        pathname: "./users/updateUser",
                        query: {
                          id: user._id,
                          name: user.name,
                          email: user.email,
                          password: user.password,
                          type: user.type,
                          isActive: user.status,
                        },
                      }}
                      className="inline-flex items-center p-2 text-black hover:text-accent/80 hover:bg-accent/10 rounded-lg transition-all duration-300 hover:scale-110 group-hover:shadow-md"
                      aria-label={`Edit user ${user.name}`}
                    >
                      <Pencil size={18} />
                    </Link>
                  </td>
                  <td className="px-6 py-4 capitalize text-foreground/80 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {user.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8">
        <Link
          href="./users/addUser"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg backdrop-blur-sm"
          aria-label="Add User"
        >
          <UserRoundPlus size={20} /> Add User
        </Link>
      </div>
    </div>
  )
}
