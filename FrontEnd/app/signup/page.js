"use client";

import { Eye, EyeOff } from "lucide-react"; // For password toggle icon
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import logo from "../../public/logo.webp";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [useStrongPassword, setUseStrongPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // === Validation ===
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      setError("Name should contain only letters and spaces.");
      return;
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      setError("Only Gmail addresses are allowed.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

    if (useStrongPassword && !strongPasswordRegex.test(password)) {
      setError(
        "Strong password must include uppercase, lowercase, number, and special character."
      );
      return;
    }

    const data = { name, email, password };

    try {
      setLoading(true);

      // === Register ===
      const res = await fetch("https://anotationtool-production.up.railway.app/api/users/addUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
          setError("This user already exists.");
        } else {
          setError(`Signup failed: ${text}`);
        }
        return;
      }

      // === Login ===
      const loginRes = await fetch("https://anotationtool-production.up.railway.app/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError(loginData.error || "Login failed.");
        return;
      }

      const { token, user } = loginData;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Account created successfully! Redirecting...");

      setTimeout(() => {
        const role = user?.userType?.toLowerCase() || "annotator";
        if (role === "admin") {
          router.push("/home/dashboard");
        } else {
          router.push("/home/annotation");
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <Image
            src={logo}
            alt="Logo"
            className="w-12 h-12 rounded-3xl mx-auto"
          />
          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Sign Up
          </h1>

          {message && (
            <p className="text-center text-green-600 dark:text-green-400">
              {message}
            </p>
          )}
          {error && (
            <p className="text-center text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="name"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              pattern="[A-Za-z\s]+"
              title="Only letters and spaces allowed"
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Gmail Address
            </label>
            <input
              id="email"
              type="email"
              required
              pattern="[^@\s]+@gmail\.com"
              title="Only Gmail is allowed"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 dark:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-2 flex items-center space-x-2">
              <input
                id="strongPassword"
                type="checkbox"
                checked={useStrongPassword}
                onChange={() => setUseStrongPassword(!useStrongPassword)}
              />
              <label
                htmlFor="strongPassword"
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                Use strong password pattern
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600"
            } text-white font-semibold py-2 rounded-lg transition`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <Link
            href="/login"
            className="text-center text-sm text-blue-700 dark:text-blue-400 hover:underline"
          >
            Already have an account?
          </Link>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
