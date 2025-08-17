"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExportData() {
  const router = useRouter();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(yesterday));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [format, setFormat] = useState("CSV");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
    }
  }, [router]);

  const isDateValid = () => {
    return startDate && endDate && startDate <= endDate;
  };

  const handleDownload = async () => {
    if (!isDateValid()) return;
    setLoading(true);

    const token = localStorage.getItem("token");
    const query = `?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&format=${format.toLowerCase()}`;

    try {
      const res = await fetch(
        `https://anotationtool-production.up.railway.app/annotation/export${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        alert("Session expired or unauthorized. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `annotations_${startDate}_to_${endDate}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert("✅ Export successful!");
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-8 my-6 sm:my-10 text-center bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Export Data
      </h2>

      {/* Date Range */}
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Date Range
        </label>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <input
            type="date"
            value={startDate}
            max={formatDate(today)}
            onChange={(e) => setStartDate(e.target.value)}
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xl text-gray-600 dark:text-gray-400">→</span>
          <input
            type="date"
            value={endDate}
            max={formatDate(today)}
            onChange={(e) => setEndDate(e.target.value)}
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {!isDateValid() && (
          <p className="text-red-500 text-sm mt-2">
            Start date must be before or equal to end date.
          </p>
        )}
      </div>

      {/* Export Format */}
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Export Format
        </label>
        <div className="flex flex-wrap justify-center gap-4">
          {["CSV", "JSON", "XLSX"].map((opt) => (
            <label
              key={opt}
              className="flex items-center space-x-2 text-gray-800 dark:text-gray-200"
            >
              <input
                type="radio"
                value={opt}
                checked={format === opt}
                onChange={(e) => setFormat(e.target.value)}
                className="accent-blue-600"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={!isDateValid() || loading}
        className={`px-6 py-2 rounded transition duration-300 ${
          !isDateValid() || loading
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Exporting..." : "Download"}
      </button>
    </div>
  );
}
