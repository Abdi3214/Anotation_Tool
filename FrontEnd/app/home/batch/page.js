"use client";
import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000/api/batch"; // adjust if needed

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

      // Load annotators for assignment step (handle errors)
      const resAnn = await fetch(`${API_BASE}/annotators`, { headers });
      if (!resAnn.ok) {
        const err = await resAnn.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load annotators");
      }
      const ann = await resAnn.json();
      // normalize _id => string to avoid ObjectId/string mismatch later
      setAnnotators((ann || []).map((a) => ({ ...a, _id: String(a._id) })));
    } catch (e) {
      setMsg(e.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (fileName, userIdRaw) => {
    const userId = String(userIdRaw);
    setSelectedByFile((prev) => {
      // clone prev shallowly
      const next = { ...prev };
      // ensure we operate on a new Set
      const current = prev[fileName];
      const set = new Set(current ? Array.from(current) : []);
      if (set.has(userId)) set.delete(userId);
      else set.add(userId);

      if (set.size === 0) {
        // remove key to keep state clean
        delete next[fileName];
      } else {
        next[fileName] = set;
      }
      return next;
    });
  };

  const buildAssignmentsFromSelected = () => {
    const userToFiles = {};
    Object.entries(selectedByFile).forEach(([fileName, maybeSet]) => {
      const arr = Array.from(maybeSet || []);
      arr.forEach((uidRaw) => {
        const uid = String(uidRaw);
        if (!userToFiles[uid]) userToFiles[uid] = [];
        userToFiles[uid].push(fileName);
      });
    });

    return Object.entries(userToFiles).map(([userId, fileNames]) => ({
      userId,
      fileNames,
    }));
  };

  const assign = async () => {
    if (!batchId) return;
    setLoading(true);
    setMsg("");

    const assignments = buildAssignmentsFromSelected();

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
      setMsg(e.message || "Assign error");
    } finally {
      setLoading(false);
    }
  };

  const unassign = async () => {
    if (!batchId) return;

    // confirm to avoid mass accidental unassignments
    if (
      !window.confirm(
        "Are you sure you want to unassign the selected users from the selected files? This action can be undone by re-assigning."
      )
    ) {
      return;
    }

    setLoading(true);
    setMsg("");

    const assignments = buildAssignmentsFromSelected();

    if (!assignments.length) {
      setMsg("Select at least one user for at least one file.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/unassign`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, assignments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unassign failed");
      setMsg(`Unassigned successfully. Modified rows: ${data.modified || 0}`);

      // Remove the unassigned user selections so UI reflects change
      setSelectedByFile((prev) => {
        const next = {};
        const removedUserIds = new Set(assignments.map((a) => String(a.userId)));
        for (const [fileName, maybeSet] of Object.entries(prev)) {
          const newSet = new Set(Array.from(maybeSet || []).filter((uid) => !removedUserIds.has(String(uid))));
          if (newSet.size) next[fileName] = newSet;
        }
        return next;
      });
    } catch (e) {
      setMsg(e.message || "Unassign error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-500">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent mb-4 tracking-tight">
            Batch Upload & Assignment
          </h1>
          <p className="text-muted-foreground text-xl font-medium">
            Upload files and assign them to annotators with ease
          </p>
        </div>

        {/* Upload Card */}
        <div
          className="group bg-card/90 backdrop-blur-xl rounded-3xl border border-border shadow-2xl p-8 mb-8 transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] hover:bg-card animate-in fade-in slide-in-from-bottom"
          style={{ animationDuration: "500ms" }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <svg
                className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-card-foreground transition-colors duration-300 group-hover:text-foreground">
              Upload Files
            </h2>
          </div>

          <div className="space-y-8">
            <div className="group/input">
              <label className="block text-sm font-bold text-muted-foreground mb-4 tracking-wide uppercase">
                Batch Name
              </label>
              <input
                className="w-full border-2 border-input rounded-2xl p-5 text-lg font-medium transition-all duration-300 focus:border-ring focus:ring-4 focus:ring-ring/20 focus:outline-none focus:scale-[1.01] group-hover/input:border-border group-hover/input:shadow-md bg-background backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
                placeholder="e.g. Somali-English Set A"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div className="group/file">
              <label className="block text-sm font-bold text-muted-foreground mb-4 tracking-wide uppercase">Files (.csv, .xlsx)</label>
              <div className="relative overflow-hidden rounded-2xl">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  multiple
                  onChange={onPickFiles}
                  className="w-full border-2 border-dashed border-border rounded-2xl p-8 text-lg font-medium transition-all duration-300 hover:border-ring focus:border-ring focus:ring-4 focus:ring-ring/20 focus:outline-none focus:scale-[1.01] file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 file:transition-all file:duration-300 file:shadow-sm hover:file:shadow-md bg-background/60 backdrop-blur-sm group-hover/file:bg-background/80 text-foreground"
                />
                <div className="absolute inset-0 bg-accent/5 opacity-0 transition-opacity duration-300 group-hover/file:opacity-100 pointer-events-none"></div>
              </div>
              {files.length > 0 && (
                <div className="mt-4 p-3 bg-secondary/80 backdrop-blur-sm rounded-xl border border-border animate-in fade-in slide-in-from-top" style={{ animationDuration: "300ms" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-secondary-foreground">
                      {files.length} file{files.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button onClick={upload} disabled={loading || !token} className="w-full bg-primary text-white font-bold py-5 px-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group/button">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-500"></div>
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span className="animate-pulse">Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 transition-transform duration-300 group-hover/button:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  Upload Files
                </>
              )}
            </button>
          </div>
        </div>

        {/* Assignment Card */}
        {batchId && (
          <div className="group bg-card/90 backdrop-blur-xl rounded-3xl border border-border shadow-2xl p-8 animate-in slide-in-from-bottom fade-in" style={{ animationDuration: "500ms" }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg className="w-6 h-6 text-accent-foreground transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-card-foreground transition-colors duration-300 group-hover:text-foreground">Assign Annotators</h2>
              </div>
              <div className="bg-muted px-5 py-3 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105">
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Batch ID: {batchId}</span>
              </div>
            </div>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-16 animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-muted-foreground text-xl font-medium">No files found for this batch</p>
              </div>
            ) : (
              <div className="space-y-8">
                {uploadedFiles.map((fname, index) => (
                  <div key={fname} className="group/file bg-muted/50 backdrop-blur-sm border border-border rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:bg-muted/80 hover:scale-[1.01] animate-in slide-in-from-left" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shadow-sm transition-all duration-300 group-hover/file:scale-110 group-hover/file:shadow-md">
                        <svg className="w-5 h-5 text-secondary-foreground transition-transform duration-300 group-hover/file:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <h3 className="font-bold text-card-foreground text-xl tracking-tight">{fname}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {annotators.map((u, userIndex) => {
                        const uid = String(u._id);
                        const checked = (selectedByFile[fname] && selectedByFile[fname].has(uid)) || false;
                        return (
                          <label key={uid} className={`group/checkbox flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.03] animate-in fade-in ${checked ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border bg-background hover:border-ring hover:shadow-md hover:bg-background/90"}`} style={{ animationDelay: `${index * 100 + userIndex * 50}ms` }}>
                            <div className="relative">
                              <input type="checkbox" checked={checked} onChange={() => toggleUser(fname, uid)} className="sr-only" />
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 group-hover/checkbox:scale-110 ${checked ? "border-primary bg-primary shadow-lg shadow-primary/30 scale-110" : "border-border bg-background group-hover/checkbox:border-ring group-hover/checkbox:shadow-sm"}`}>
                                {checked && (
                                  <svg className="w-4 h-4 text-primary-foreground animate-in zoom-in spin-in" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </div>
                            </div>
                            <span className={`font-semibold transition-all duration-300 group-hover/checkbox:scale-105 ${checked ? "text-primary" : "text-foreground group-hover/checkbox:text-foreground"}`}>{u.name || u.email}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4">
              {/* Assign button */}
              <button onClick={assign} disabled={loading || !uploadedFiles.length} className="flex-1 w-full mt-10 bg-accent text-accent-foreground font-bold py-5 px-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group/assign">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-foreground/20 to-transparent -translate-x-full group-hover/assign:translate-x-full transition-transform duration-500"></div>
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    <span className="animate-pulse">Assigning...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 transition-transform duration-300 group-hover/assign:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Save Assignments
                  </>
                )}
              </button>

              {/* Unassign button */}
              <button onClick={unassign} disabled={loading || !uploadedFiles.length} className="flex-1 w-full mt-10 bg-destructive text-destructive-foreground font-bold py-5 px-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group/unassign">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive-foreground/10 to-transparent -translate-x-full group-hover/unassign:translate-x-full transition-transform duration-500"></div>
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                    <span className="animate-pulse">Unassigning...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 transition-transform duration-300 group-hover/unassign:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6m0 0l4-4m-4 4l4 4" /></svg>
                    Unassign Selected
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message Display */}
        {msg && (
          <div className={`mt-8 p-6 rounded-2xl border-2 animate-in slide-in-from-bottom fade-in backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${msg.includes("successfully") ? "bg-secondary border-border text-secondary-foreground shadow-lg" : "bg-destructive/10 border-destructive text-destructive shadow-lg shadow-destructive/20"}`} style={{ animationDuration: "300ms" }}>
            <div className="flex items-center gap-3">
              {msg.includes("successfully") ? (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              )}
              <span className="font-bold text-lg">{msg}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
