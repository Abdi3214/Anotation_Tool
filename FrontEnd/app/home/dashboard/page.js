"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard({ name }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({
    overview: {},
    errors: {},
    perUser: [],
    datasets: [],
    timeline: { perDay: [], errorsPerDay: [] },
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) router.push("/login");
    else setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    fetch("https://anotationtool-production.up.railway.app/api/report", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard", err);
        setError(true);
        setLoading(false);
      });
  }, [token]);

  const downloadReport = async (format) => {
    try {
      const res = await fetch(
        `https://anotationtool-production.up.railway.app/api/report?format=${format}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download report");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-semibold">
            Failed to load dashboard data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, errors, perUser, datasets, timeline } = stats;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <span className="font-medium">{name || "User"}</span>
          <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center uppercase font-semibold">
            {name?.charAt(0) || "U"}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {overview.totalAnnotations || 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Annotations
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {perUser.length}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Users Annotating
          </p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {datasets.reduce((acc, ds) => acc + ds.assignedTo.length, 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Total Assigned
          </p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Annotations This Week
          </h2>
          {timeline.perDay.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No annotation data available.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={timeline.perDay.map((d) => ({ name: d._id, value: d.count }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "#f9f9f9" }} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Errors This Week
          </h2>
          {timeline.errorsPerDay.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No error data available.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={timeline.errorsPerDay.map((d) => ({ name: d._id, value: d.errors }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "#f9f9f9" }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Reports Download */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => downloadReport("json")}
            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Download JSON
          </button>
          <button
            onClick={() => downloadReport("csv")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
          >
            Download CSV
          </button>
          <button
            onClick={() => downloadReport("xlsx")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Download Excel
          </button>
        </div>
      </section>

      {/* Per User Table */}
      {perUser.length > 0 && (
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Annotations Per User
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-center">Total</th>
                  <th className="px-4 py-2 text-center">Completed</th>
                  <th className="px-4 py-2 text-center">Skipped</th>
                  <th className="px-4 py-2 text-center">Pending</th>
                  <th className="px-4 py-2 text-center">In Progress</th>
                </tr>
              </thead>
              <tbody>
                {perUser.map((u) => (
                  <tr key={u.email} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2 text-center">{u.total}</td>
                    <td className="px-4 py-2 text-center">{u.completed}</td>
                    <td className="px-4 py-2 text-center">{u.skipped}</td>
                    <td
                      className={`px-4 py-2 text-center ${
                        u.pending > 0 ? "bg-yellow-200 dark:bg-yellow-700 font-semibold" : ""
                      }`}
                    >
                      {u.pending}
                    </td>
                    <td
                      className={`px-4 py-2 text-center ${
                        u.inProgress > 0 ? "bg-blue-200 dark:bg-blue-700 font-semibold" : ""
                      }`}
                    >
                      {u.inProgress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
