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
  const [exportAll, setExportAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
    }
  }, [router]);

  // 🟢 Clear error when filters change
  useEffect(() => {
    setErrorMsg("");
  }, [startDate, endDate, format, exportAll]);

  const isDateValid = () => {
    return exportAll || (startDate && endDate && startDate <= endDate);
  };

  const handleDownload = async () => {
    if (!isDateValid()) {
      setErrorMsg("Start date must be before or equal to end date.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    const token = localStorage.getItem("token");
    const queryParams = [];
    if (!exportAll) {
      queryParams.push(`start=${encodeURIComponent(startDate)}`);
      queryParams.push(`end=${encodeURIComponent(endDate)}`);
    }
    queryParams.push(`format=${format.toLowerCase()}`);
    const query = `?${queryParams.join("&")}`;

    try {
      const res = await fetch(
        `http://localhost:5000/api/annotation/export${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
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

      // use header set by server
      const total = parseInt(res.headers.get("x-total-count") || "0", 10);

      if (!res.ok && res.status === 404) {
        setErrorMsg("No annotations found for the selected filters.");
        setLoading(false);
        return;
      }

      // If server returned ok but 0 rows, show friendly message and still create an empty file (server already behaves this way)
      if (total === 0) {
        // read a small sample or the file (server returns headers-only file). We'll still go ahead and download it
        const blobData = await res.blob();
        if (!blobData || blobData.size === 0) {
          setErrorMsg("No annotations found for the selected filters.");
          setLoading(false);
          return;
        }

        // still download (empty-with-headers), and inform user
        const filename = `annotations_${
          exportAll ? "all" : `${startDate}_to_${endDate}`
        }.${
          format.toLowerCase() === "xlsx"
            ? "xlsx"
            : format.toLowerCase() === "json"
            ? "json"
            : "csv"
        }`;
        const url = window.URL.createObjectURL(blobData);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        alert(
          "No annotations matched the filters. A (headers-only) file was downloaded."
        );
        setLoading(false);
        return;
      }

      // normal path: there are rows
      let blob;
      let filename = `annotations_${
        exportAll ? "all" : `${startDate}_to_${endDate}`
      }`;

      switch (format.toLowerCase()) {
        case "json":
          const jsonText = await res.text();
          blob = new Blob([jsonText], { type: "application/json" });
          filename += ".json";
          break;

        case "csv":
          const csvText = await res.text();
          blob = new Blob([csvText], { type: "text/csv" });
          filename += ".csv";
          break;

        case "xlsx":
          const arrayBuffer = await res.arrayBuffer();
          blob = new Blob([arrayBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          filename += ".xlsx";
          break;

        default:
          throw new Error("Unsupported format");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert(`✅ Export successful! ${total} row(s) downloaded.`);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-8 my-10 text-center bg-card/90 backdrop-blur-xl rounded-3xl border border-border shadow-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-foreground bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Export Data
        </h2>
        <p className="text-muted-foreground">
          Export your annotation data in your preferred format
        </p>
      </div>

      {/* ✅ Export All Dates Toggle */}
      <div className="mb-6 flex justify-center items-center gap-3">
        <input
          type="checkbox"
          id="exportAll"
          checked={exportAll}
          onChange={(e) => setExportAll(e.target.checked)}
          className="w-5 h-5 border border-border rounded accent-accent"
        />
        <label htmlFor="exportAll" className="text-foreground font-semibold">
          Export All Dates
        </label>
      </div>

      {/* ✅ Date Range Picker */}
      {!exportAll && (
        <div className="mb-8 p-6 bg-muted/30 rounded-2xl border border-border/50">
          <label className="block text-foreground font-semibold mb-4 text-lg">
            📅 Date Range
          </label>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <input
              type="date"
              value={startDate}
              max={formatDate(today)}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border-2 border-border text-foreground px-4 py-3 rounded-xl"
            />
            <span className="font-bold">→</span>
            <input
              type="date"
              value={endDate}
              max={formatDate(today)}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border-2 border-border text-foreground px-4 py-3 rounded-xl"
            />
          </div>
        </div>
      )}

      {/* ✅ Export Format */}
      <div className="mb-8 p-6 bg-muted/30 rounded-2xl border border-border/50">
        <label className="block text-foreground font-semibold mb-4 text-lg">
          📄 Export Format
        </label>
        <div className="flex flex-wrap justify-center gap-4">
          {["CSV", "JSON", "XLSX"].map((opt) => (
            <label
              key={opt}
              className={`group flex items-center space-x-3 p-4 bg-background border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                format === opt ? "border-accent" : "border-border"
              }`}
            >
              <input
                type="radio"
                value={opt}
                checked={format === opt}
                onChange={(e) => setFormat(e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 ${
                  format === opt ? "border-accent bg-accent" : "border-border"
                }`}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ✅ Error Message */}
      {errorMsg && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* ✅ Download Button */}
      <div className="relative mt-6">
        <button
          onClick={handleDownload}
          disabled={!isDateValid() || loading}
          className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
            !isDateValid() || loading
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-105"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Exporting...</span>
            </div>
          ) : (
            <>
              <span>📥</span> <span>Download Export</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
