"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useStore } from "../../../context/UserContext"

export default function Dashboard({ name }) {
  const router = useRouter()
  const { user, setUser } = useStore([])
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [stats, setStats] = useState({
    overview: {},
    errors: {},
    perUser: [],
    datasets: [],
    timeline: { perDay: [], errorsPerDay: [] },
  })

  useEffect(() => {
    const t = localStorage.getItem("token")
    if (!t) router.push("/login")
    else setToken(t)
  }, [router])

  useEffect(() => {
    if (!token) return

    fetch("http://localhost:5000/api/report", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
        setError(false)
      })
      .catch((err) => {
        console.error("Failed to load dashboard", err)
        setError(true)
        setLoading(false)
      })
  }, [token])

  const downloadReport = async (format) => {
    try {
      const res = await fetch(`http://localhost:5000/api/report?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Download failed")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Failed to download report")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-lg text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
          <p className="text-destructive font-semibold text-lg">Failed to load dashboard data.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { overview, errors, perUser, datasets, timeline } = stats

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border backdrop-blur-sm">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <div className="flex items-center gap-3 text-foreground">
          <span className="font-medium text-lg">{user.userType || "User"}</span>
          <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center uppercase font-bold shadow-lg">
            {name?.charAt(0) || "U"}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="group p-8 rounded-2xl border border-border shadow-lg text-center bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {overview.totalAnnotations || 0}
          </p>
          <p className="text-sm text-muted-foreground font-medium">Total Annotations</p>
        </div>
        <div className="group p-8 rounded-2xl border border-border shadow-lg text-center bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {perUser.length}
          </p>
          <p className="text-sm text-muted-foreground font-medium">Users Annotating</p>
        </div>
        <div className="group p-8 rounded-2xl border border-border shadow-lg text-center bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-card">
          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {datasets.reduce((acc, ds) => acc + ds.assignedTo.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground font-medium">Total Assigned</p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Annotations This Week
          </h2>
          {timeline.perDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No annotation data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeline.perDay.map((d) => ({ name: d._id, value: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border shadow-lg transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Errors This Week
          </h2>
          {timeline.errorsPerDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No error data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeline.errorsPerDay.map((d) => ({ name: d._id, value: d.errors }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Reports Download */}
      <section className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg space-y-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => downloadReport("json")}
            className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10">Download JSON</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <button
            onClick={() => downloadReport("csv")}
            className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10">Download CSV</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <button
            onClick={() => downloadReport("xlsx")}
            className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10">Download Excel</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </section>

      {/* Per User Table */}
      {perUser.length > 0 && (
        <section className="bg-card/80 backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Annotations Per User
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Email</th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">Total</th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">Completed</th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">Skipped</th>
                </tr>
              </thead>
              <tbody>
                {perUser.map((u, index) => (
                  <tr key={u.email} className="border-t border-border hover:bg-muted/30 transition-colors duration-200">
                    <td className="px-6 py-4 font-medium text-foreground">{u.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4 text-center font-semibold text-foreground">{u.total}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-semibold">{u.completed}</td>
                    <td className="px-6 py-4 text-center text-muted-foreground">{u.skipped}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
