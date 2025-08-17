"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../../context/UserContext";
import EditProfileForm from "./EditProfileForm";

export default function Profile() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [annotations, setAnnotations] = useState([]);
  const [completedAnnotations, setCompletedAnnotations] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEditProfileForm, setShowEditProfileForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(user || null);
  const editProfileRef = useRef(null);

  // ✅ Logout user and clear storage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // ✅ Fetch profile details, annotations, and pending reviews
  const fetchProfileData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const [pendingRes, annotationsRes, userRes] = await Promise.all([
        fetch("https://anotationtool-production.up.railway.app/api/annotation/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://anotationtool-production.up.railway.app/api/annotation/Allannotation", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://anotationtool-production.up.railway.app/api/users/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (
        [pendingRes.status, annotationsRes.status, userRes.status].includes(401)
      ) {
        router.push("/login");
        return;
      }

      const pendingData = await pendingRes.json();
      const annotationsData = await annotationsRes.json();
      const userData = await userRes.json();

      setPendingReviews(pendingData.count || 0);
      setAnnotations(annotationsData);
      setCompletedAnnotations(annotationsData.length || 0);
      setCurrentUser(userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const formattedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const progressPercentage =
    completedAnnotations + pendingReviews > 0
      ? Math.round(
          (completedAnnotations /
            (completedAnnotations + pendingReviews)) *
            100
        )
      : 0;

  // ✅ Toggle edit form visibility and scroll into view
  const handleEditProfileToggle = () => {
    setShowEditProfileForm((prev) => !prev);
    setTimeout(() => {
      if (editProfileRef.current) {
        editProfileRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-700 dark:text-gray-300">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600" />
        <span className="ml-4">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl shadow-lg max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6 border-b pb-4">
        <div className="w-24 h-24 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
          {currentUser?.name?.charAt(0) || "U"}
        </div>
        <div className="mt-4 sm:mt-0 text-center sm:text-left">
          <h2 className="text-2xl font-bold">{currentUser?.name || "Anonymous"}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {currentUser?.email || "Not Available"}
          </p>
          <p className="text-sm text-gray-500">Joined: {formattedDate}</p>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Completed Annotations</span>
          <span className="font-semibold">{completedAnnotations}</span>
        </div>
        <div className="flex justify-between">
          <span>Pending Reviews</span>
          <span className="font-semibold">{pendingReviews}</span>
        </div>

        {/* Progress Bar */}
        <div>
          <p className="mb-1 font-medium">Progress</p>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-right text-gray-500 mt-1">
            {progressPercentage}%
          </p>
        </div>

        {/* Buttons: Edit Profile & Logout */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={handleEditProfileToggle}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {showEditProfileForm ? "Hide Edit Profile" : "Edit Profile"}
            </button>

            {showEditProfileForm && currentUser && (
              <div ref={editProfileRef} className="mt-4">
                <EditProfileForm
                  user={currentUser}
                  onUpdate={() => {
                    fetchProfileData(); // ✅ Refresh after update
                    setShowEditProfileForm(false); // ✅ Hide after update
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 mt-4 bg-red-500 hover:bg-red-600 text-white rounded-md shadow transition w-full sm:w-auto"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
