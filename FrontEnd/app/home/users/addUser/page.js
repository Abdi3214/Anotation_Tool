"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
function AddUser() {
  const [name, setName] = useState([]);
  const [email, setEmail] = useState([]);
  const [password, setPassword] = useState([]);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token || !user) {
      router.push("/login");
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name,
      email,
      password,
    };
    const res = await fetch(`https://anotationtool-production.up.railway.app/api/users/addUsers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 409) {
        alert("This user already exists. Please try a different one.");
      } else {
        console.error(`Save failed: ${res.status} ${res.statusText} - ${text}`);
        alert("Failed to save user.");
      }
      return;
    }
    const result = await res.json();
    console.log("Saved user:", result);
    router.push("/home/users");
  };
  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-4 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg p-6 bg-white dark:bg-[#0a0a0a]"
      >
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Name:
        </label>
        <input
          type="text"
          required
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
        />

        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Email:
        </label>
        <input
          type="email"
          required
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
        />

        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Password:
        </label>
        <input
          type="password"
          required
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md"
        />

        <button
          type="submit"
          className="w-28 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddUser;
