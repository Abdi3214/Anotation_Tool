"use client";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // 👁️ Import icons
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "../../context/UserContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useStore();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.password) {
      setMessage("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("https://anotationtool-production.up.railway.app/api/users/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      setMessage("Login successful! Redirecting...");

      setTimeout(() => {
        if (res.data.user.userType === "Admin") {
          router.push("/home/dashboard");
        } else {
          router.push("/home/annotation");
        }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#0a0a0a] px-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Login
        </h2>

        {message && (
          <p
            className={`text-center mt-2 ${
              message.includes("success")
                ? "text-green-600 dark:text-green-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold py-2 rounded-lg transition`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
