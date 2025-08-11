"use client";

import { useRouter } from "next/navigation";
import { Trash } from "phosphor-react";
import { useEffect, useState } from "react";

const SavedPage = () => {
  const router = useRouter();
  const [savedText, setSavedText] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-200 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "In Progress":
        return "bg-blue-200 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400";
      case "Completed":
        return "bg-green-200 text-green-800 dark:bg-green-500/20 dark:text-green-400";
      default:
        return "bg-gray-200 text-gray-800 dark:bg-gray-600/20 dark:text-white";
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) router.push("/login");
  }, [router]);

  const fetchSavedText = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) throw new Error("Annotator ID missing");

      const res = await fetch(
        `https://anotationtool-production.up.railway.app/api/annotation/assigned/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
  }, []);

  const handleDeleteAll = async () => {
    if (!confirm("Delete all annotations? This action cannot be undone."))
      return;
    const token = localStorage.getItem("token");
    try {
      setDeletingAll(true);
      const res = await fetch(
        "https://anotationtool-production.up.railway.app/api/annotation/deleteAll",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete all.");
      fetchSavedText();
    } catch (err) {
      alert("Could not delete all annotations.");
      console.error(err);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this annotation?")) return;
    const token = localStorage.getItem("token");
    try {
      setDeletingId(id);
      const res = await fetch(
        `https://anotationtool-production.up.railway.app/api/annotation/rebortAnnotationDelete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete annotation.");
      fetchSavedText();
    } catch (err) {
      alert("Failed to delete this annotation.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

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
          {!loading && savedText.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className={`${
                deletingAll
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              } text-white px-4 py-2 rounded-md shadow text-sm sm:text-base transition`}
            >
              {deletingAll ? "Deleting..." : "Delete All"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm sm:text-base">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
              <tr>
                <th className="px-6 py-3 border-b text-left">Text ID</th>
                <th className="px-6 py-3 border-b text-left">Source</th>
                <th className="px-6 py-3 border-b text-left">Due Date</th>
                <th className="px-6 py-3 border-b text-left">Status</th>
                <th className="px-6 py-3 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center px-6 py-6">
                    <span className="animate-pulse text-gray-500 dark:text-gray-400">
                      Loading...
                    </span>
                  </td>
                </tr>
              ) : savedText.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center px-6 py-6 text-gray-500 dark:text-gray-400"
                  >
                    No assigned texts found.
                  </td>
                </tr>
              ) : (
                savedText.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4 border-b">{item.id}</td>
                    <td className="px-6 py-4 border-b max-w-sm truncate">
                      {item.source}
                    </td>
                    <td className="px-6 py-4 border-b">{item.due}</td>
                    <td className="px-6 py-4 border-b">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b">
                      <div className="flex items-center gap-3">
                        {item.status !== "Completed" && (
                          <button
                            onClick={() => {
                              localStorage.setItem("startSrc", item.source);
                              localStorage.setItem(
                                "startedFromAssigned",
                                "true"
                              );
                              router.push("/home/annotation");
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-4 rounded-md shadow-sm transition-all"
                          >
                            Start
                          </button>
                        )}
                        <Trash
                          onClick={() => handleDelete(item._id)}
                          size={22}
                          className={`cursor-pointer transition-transform hover:scale-110 ${
                            deletingId === item._id
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }`}
                          color="#dc2626"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default SavedPage;
