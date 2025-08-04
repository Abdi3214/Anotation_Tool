"use client";
import { Pencil, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ Make sure this is imported
import { Trash } from "phosphor-react";
import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.userType !== "Admin") {
      router.push("/login"); // Redirect if not Admin
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/users/usersAll",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }
      const data = await res.json();
      const mapped = data.map((user) => ({
        id: user.Annotator_ID,
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        type: user.userType,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("totalUsers", users.length);
    }
  }, [users]);
  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/deleteUser/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Delete failed: ${res.status} - ${errorText}`);
        alert("Failed to delete annotations.");
        return;
      }
      fetchUsers();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong.");
    }
  };

  const TableSkeleton = ({ rows = 6 }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left">
              {Array(6)
                .fill(0)
                .map((_, idx) => (
                  <th key={idx} className="px-4 py-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-[70%] animate-pulse"></div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {Array(rows)
              .fill(0)
              .map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                  {Array(6)
                    .fill(0)
                    .map((_, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </td>
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Users
      </h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a]">
        {loading ? (
          <TableSkeleton rows={10} />
        ) : (
          <table className="min-w-full text-sm text-left table-auto">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  ID
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Edit
                </th>
                <th scope="col" className="px-4 py-3 whitespace-nowrap">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {user.id || user._id}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200 break-words max-w-xs">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {user.type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={{
                        pathname: "./users/updateUser",
                        query: {
                          id: user._id,
                          name: user.name,
                          email: user.email,
                          password: user.password,
                          type: user.type,
                        },
                      }}
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                      aria-label={`Edit user ${user.name}`}
                    >
                      <Pencil size={18} />
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(user._id)}
                      aria-label={`Delete user ${user.name}`}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 rounded"
                    >
                      <Trash size={20} color="#ef4444" title="Delete user" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="./users/addUser"
          className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-md transition"
          aria-label="Add User"
        >
          <UserRoundPlus size={18} /> Add User
        </Link>
      </div>
    </div>
  );
}
