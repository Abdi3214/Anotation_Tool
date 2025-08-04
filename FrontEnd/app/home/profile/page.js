'use client';
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../../context/UserContext";
import ChangePasswordForm from "./changePasswordForm";

export default function Profile() {
  const router = useRouter();
  const { user } = useStore();
  const [annotations, setAnnotations] = useState([]);
  const [completedAnnotations, setCompletedAnnotations] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  const changePasswordRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [pendingRes, annotationsRes] = await Promise.all([
          fetch("https://anotationtoolbackend-production.up.railway.app/api/annotation/pending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://anotationtoolbackend-production.up.railway.app/api/annotation/Allannotation", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if ([pendingRes.status, annotationsRes.status].includes(401)) {
          router.push("/login");
          return;
        }

        const pendingData = await pendingRes.json();
        const annotationsData = await annotationsRes.json();

        setPendingReviews(pendingData.count || 0);
        setAnnotations(annotationsData);
        setCompletedAnnotations(annotationsData.length || 0);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  const progressPercentage =
    completedAnnotations + pendingReviews > 0
      ? Math.round(
          (completedAnnotations / (completedAnnotations + pendingReviews)) * 100
        )
      : 0;

  const handleChangePasswordToggle = () => {
    setShowChangePasswordForm((prev) => !prev);
    setTimeout(() => {
      if (!showChangePasswordForm && changePasswordRef.current) {
        changePasswordRef.current.scrollIntoView({ behavior: "smooth" });
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
    <div className="p-6 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 rounded-xl shadow-md max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6">
        <div className="w-24 h-24 sm:w-16 sm:h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 sm:mt-0 text-center sm:text-left">
          <h2 className="text-xl font-bold">{user?.name || "Anonymous"}</h2>
          <p className="text-gray-600 dark:text-gray-400">{user?.email || "Not Available"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Joined: {formattedDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-6 text-sm sm:text-base">
        <div className="flex justify-between">
          <p>Completed Annotations</p>
          <span className="font-medium">{completedAnnotations}</span>
        </div>
        <div className="flex justify-between">
          <p>Pending Reviews</p>
          <span className="font-medium">{pendingReviews}</span>
        </div>

        {/* Progress */}
        <div>
          <p className="mb-1 font-medium">Progress</p>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-right text-gray-500 dark:text-gray-400 mt-1">
            {progressPercentage}%
          </p>
        </div>

        {/* Change Password Button */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mt-6">
          <button
            onClick={handleChangePasswordToggle}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {showChangePasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {/* Show Change Password Form */}
        {showChangePasswordForm && (
          <div ref={changePasswordRef} className="mt-6">
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}
