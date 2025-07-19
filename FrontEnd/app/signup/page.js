'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import logo from '../../public/logo.webp';
const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    // Client-side validation
    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const data = { name, email, password };

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/users/addUsers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
          setError("This user already exists. Please try another.");
        } else {
          setError(`Sign up failed: ${res.statusText}`);
        }
        setLoading(false);
        return;
      }

      const loginRes = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.error || 'Login after register failed');
      }

      const { token, user } = await loginRes.json();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setMessage('Account created successfully! Redirecting...');

      setTimeout(() => {
        if (user.userType === 'Admin') {
          router.push(`/home/dashboard?name=${encodeURIComponent(name)}`);
        } else if (user.userType === 'annotator') {
          router.push("/home/annotation");
        } else {
          setError("Unknown user role.");
        }
      }, 1500);

    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          <Image className="w-12 h-12 rounded-3xl mx-auto" src={logo} alt="Logo" />

          <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            Sign Up to your account
          </h1>

          {message && <p className="text-center text-green-600 dark:text-green-400">{message}</p>}
          {error && <p className="text-center text-red-600 dark:text-red-400">{error}</p>}

          <div>
            <label htmlFor="name" className="text-sm text-gray-600 dark:text-gray-300">Full Name</label>
            <input
              id="name"
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm text-gray-600 dark:text-gray-300">Email Address</label>
            <input
              id="email"
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm text-gray-600 dark:text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-600'
            } text-white font-semibold py-2 rounded-lg transition`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>

          <Link href="/login" className="text-center text-sm text-blue-700 dark:text-blue-400 hover:underline">
            Already have an account?
          </Link>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
