"use client";
import { useState } from "react";
export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setMessage("New password and confirm password do not match.");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://anotationtool-production.up.railway.app/api/users/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setIsError(false); // success
      setMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setIsError(true); // error
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-4 mt-6 max-w-md">
      <h2 className="text-lg font-semibold">Change Password</h2>

      <input
        type="password"
        placeholder="Current Password"
        className="w-full p-2 border rounded"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="New Password"
        className="w-full p-2 border rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Confirm New Password"
        className="w-full p-2 border rounded"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {message && (
        <p className={`text-sm ${isError ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
