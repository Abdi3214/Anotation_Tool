"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SavedPage = () => {
  const router = useRouter();
  const [savedText, setSavedText] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "In Progress":
        return "bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "Completed":
        return "bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      case "Skipped":
        return "bg-gray-300 text-gray-800 dark:bg-gray-600/20 dark:text-gray-400";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-600/20 dark:text-white";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
    } else {
      setUserToken(token);
    }
  }, [router]);

  const fetchSavedText = async () => {
    if (!userToken) return;

    setLoading(true);
    try {
      const res = await fetch("https://anotationtool-production.up.railway.app/api/annotation/Allassigned", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch assignments");
      const data = await res.json();
      setSavedText(data);
    } catch (err) {
      console.error("Error fetching assigned texts:", err);
      setSavedText([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedText();
  }, [userToken]);

  const startAnnotation = (id, source) => {
    localStorage.setItem("startSrc", source);
    localStorage.setItem("startedFromAssigned", "true");
    router.push("/home/annotation");
  };

  if (savedText === null) {
    return (
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 text-gray-900 dark:text-white flex items-center justify-center">
        <span className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Saved Annotations</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review or continue your assigned texts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm sm:text-base">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <tr>
                <th className="px-6 py-3 border-b text-left">Text ID</th>
                <th className="px-6 py-3 border-b text-left">Email</th>
                <th className="px-6 py-3 border-b text-left">Source</th>
                <th className="px-6 py-3 border-b text-left">Due Date</th>
                <th className="px-6 py-3 border-b text-left">Status</th>
                <th className="px-6 py-3 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center px-6 py-6">
                    <span className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</span>
                  </td>
                </tr>
              ) : savedText.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center px-6 py-6 text-gray-500 dark:text-gray-400">
                    No assigned texts found.
                  </td>
                </tr>
              ) : (
                savedText.map((item) => {
                  const displayStatus = item.Skipped ? "Skipped" : item.status || "Pending";

                  return (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4 border-b">{item._id}</td>
                      <td className="px-6 py-4 border-b">{item.email}</td>
                      <td className="px-6 py-4 border-b max-w-sm truncate">{item.source}</td>
                      <td className="px-6 py-4 border-b">{item.due}</td>
                      <td className="px-6 py-4 border-b">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b">
                        <button
                          onClick={() => startAnnotation(item._id, item.source)}
                          
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default SavedPage;
