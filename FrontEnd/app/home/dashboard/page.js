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
  const [totalAnnotations, setTotalAnnotations] = useState(0);
  const [annotationsPerUser, setAnnotationsPerUser] = useState(0);
  const [annotationsData, setAnnotationsData] = useState([]);
  const [errorsData, setErrorsData] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
    } else {
      setToken(t);
    }
  }, [router]);

  useEffect(() => {
    if (!token) return;

    fetch("https://anotationtool-production.up.railway.app/api/annotation/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTotalAnnotations(data.totalAnnotations);
        setAnnotationsPerUser(data.annotationsPerUser);

        const formatDate = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("en-US", { weekday: "short" });
        };

        setAnnotationsData(
          (data.annotationsByDay || []).map((item) => ({
            name: formatDate(item._id),
            value: item.count,
          }))
        );

        setErrorsData(
          (data.errorByDay || []).map((item) => ({
            name: formatDate(item._id),
            value: item.value,
          }))
        );

        setError(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data", err);
        setError(true);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-semibold">Failed to load dashboard data.</p>
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
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalAnnotations}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">Total Annotations</p>
        </div>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow text-center bg-white dark:bg-gray-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {annotationsPerUser}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-300">Annotations per User</p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Annotations This Week
          </h2>
          {annotationsData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No annotation data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={annotationsData}>
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
          {errorsData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No error data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={errorsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "#f9f9f9" }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}

