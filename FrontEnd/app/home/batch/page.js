// app/admin/batches/page.jsx  (Next.js)  or any React route
"use client";
import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://anotationtool-production.up.railway.app/api/batch"; // adjust if needed

export default function BatchUploader() {
  const [token, setToken] = useState("");
  const [batchName, setBatchName] = useState("");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [batchId, setBatchId] = useState(null);
  const [annotators, setAnnotators] = useState([]);
  const [selectedByFile, setSelectedByFile] = useState({}); // fileName -> Set(userId)
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Load token from storage/context as you do in your app
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const onPickFiles = (e) => {
    const fd = Array.from(e.target.files || []);
    setFiles(fd);
  };

  const upload = async () => {
    if (!batchName || !files.length) {
      setMsg("Batch name and files are required.");
      return;
    }
    setLoading(true);
    setMsg("");

    try {
      const form = new FormData();
      form.append("batchName", batchName);
      files.forEach((f) => form.append("files", f));

      const res = await fetch(`${API_BASE}/upload-multiple`, {
        method: "POST",
        headers, // do not set Content-Type when sending FormData
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setBatchId(data.batchId);
      setUploadedFiles(data.files || []);
      setMsg("Uploaded successfully. Now assign users to each file.");

      // Load annotators for assignment step
      const resAnn = await fetch(`${API_BASE}/annotators`, { headers });
      const ann = await resAnn.json();
      setAnnotators(ann || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (fileName, userId) => {
    setSelectedByFile((prev) => {
      const set = new Set(prev[fileName] || []);
      if (set.has(userId)) set.delete(userId);
      else set.add(userId);
      return { ...prev, [fileName]: set };
    });
  };

  const assign = async () => {
    if (!batchId) return;
    setLoading(true);
    setMsg("");

    // Prepare payload: [{ userId, fileNames: [...] }, ...]
    // We invert file -> users into user -> files
    const userToFiles = {};
    Object.entries(selectedByFile).forEach(([fileName, set]) => {
      set.forEach((uid) => {
        if (!userToFiles[uid]) userToFiles[uid] = [];
        userToFiles[uid].push(fileName);
      });
    });

    const assignments = Object.entries(userToFiles).map(
      ([userId, fileNames]) => ({
        userId,
        fileNames,
      })
    );

    if (!assignments.length) {
      setMsg("Select at least one user for at least one file.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/assign`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, assignments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assign failed");
      setMsg(`Assigned successfully. Modified rows: ${data.modified || 0}`);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Batch Upload & File Assignment
      </h1>

      {/* Upload Card */}
      <div className="rounded-2xl border p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Batch name</label>
        <input
          className="w-full border rounded-xl p-2 mb-4"
          placeholder="e.g. Somali-English Set A"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
        />

        <label className="block text-sm font-medium mb-2">
          Files (.csv, .xlsx)
        </label>
        <input
          type="file"
          accept=".csv,.xlsx"
          multiple
          onChange={onPickFiles}
          className="w-full border rounded-xl p-2"
        />

        <button
          onClick={upload}
          disabled={loading || !token}
          className="mt-4 px-4 py-2 rounded-2xl shadow border hover:shadow-md disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Assign Card */}
      {batchId && (
        <div className="rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Assign users to files</h2>
            <span className="text-xs text-gray-500">Batch ID: {batchId}</span>
          </div>

          {uploadedFiles.length === 0 ? (
            <p className="text-sm text-gray-600">
              No files found for this batch.
            </p>
          ) : (
            <div className="space-y-6">
              {uploadedFiles.map((fname) => (
                <div key={fname} className="border rounded-xl p-3">
                  <div className="font-medium mb-2">{fname}</div>
                  {/* Annotators multiselect as checkbox pills */}
                  <div className="flex flex-wrap gap-2">
                    {annotators.map((u) => {
                      const checked =
                        selectedByFile[fname]?.has(u._id) || false;
                      return (
                        <label
                          key={u._id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleUser(fname, u._id)}
                            className="h-4 w-4"
                          />
                          {u.name || u.email}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={assign}
            disabled={loading || !uploadedFiles.length}
            className="mt-4 px-4 py-2 rounded-2xl shadow border hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Save Assignments"}
          </button>
        </div>
      )}

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
