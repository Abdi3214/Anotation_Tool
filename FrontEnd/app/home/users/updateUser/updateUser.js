"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdateUser() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
    }
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState(true);

  const id = searchParams.get("id") ?? "";
  const initialName = searchParams.get("name") ?? "";
  const initialEmail = searchParams.get("email") ?? "";
  const initialType = searchParams.get("type") ?? "";
  const initialIsActive = searchParams.get("isActive") === "true";

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
    setType(initialType);
    setIsActive(initialIsActive);
  }, [initialName, initialEmail, initialType, initialIsActive]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      email,
      userType: type,
      isActive: isActive,
    };

    if (password.trim()) {
      data.password = password; // Include password only if user enters a new one
    }

    try {
      const res = await fetch(`https://anotationtool-production.up.railway.app/api/users/UpdateUsers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
          alert("This user already exists. Please try a different one.");
        } else {
          console.error(`Save failed: ${res.status} – ${text}`);
          alert("Failed to save user.");
        }
        return;
      }

      await res.json();
      router.push("/home/users");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating the user.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-5 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-6 bg-white dark:bg-[#0a0a0a] transition-all duration-300"
      >
        {/* Name (Disabled) */}
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            disabled
            className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 p-2 rounded-md cursor-not-allowed"
          />
        </div>

        {/* Email (Disabled) */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            disabled
            className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 p-2 rounded-md cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Password (Leave blank to keep current)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
          />
        </div>

        {/* Type (Dropdown) */}
        <div className="flex flex-col">
          <label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Type
          </label>
          <select
            id="type"
            value={type}
            required
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
          >
            <option value="" disabled>
              Select role
            </option>
            <option value="annotator">Annotator</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Status (Dropdown) */}
        <div className="flex flex-col">
          <label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Status
          </label>
          <select
            id="status"
            value={isActive ? "true" : "false"}
            required
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-md transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
