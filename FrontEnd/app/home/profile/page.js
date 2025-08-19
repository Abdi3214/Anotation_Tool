"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useStore } from "../../../context/UserContext"
import EditProfileForm from "./EditProfileForm"

export default function Profile() {
  const router = useRouter()
  const { user, setUser } = useStore()
  const [annotations, setAnnotations] = useState([])
  const [completedAnnotations, setCompletedAnnotations] = useState(0)
  const [pendingReviews, setPendingReviews] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEditProfileForm, setShowEditProfileForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(user || null)
  const editProfileRef = useRef(null)

  // ✅ Logout user and clear storage
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  // ✅ Fetch profile details, annotations, and pending reviews
  const fetchProfileData = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    try {
      const [pendingRes, annotationsRes, userRes] = await Promise.all([
        fetch("http://localhost:5000/api/annotation/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/annotation/Allannotation", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/users/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if ([pendingRes.status, annotationsRes.status, userRes.status].includes(401)) {
        router.push("/login")
        return
      }

      const pendingData = await pendingRes.json()
      const annotationsData = await annotationsRes.json()
      const userData = await userRes.json()

      setPendingReviews(pendingData.count || 0)
      setAnnotations(annotationsData)
      setCompletedAnnotations(annotationsData.length || 0)
      setCurrentUser(userData)
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (err) {
      console.error("Error fetching profile data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const formattedDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A"

  const progressPercentage =
    completedAnnotations + pendingReviews > 0
      ? Math.round((completedAnnotations / (completedAnnotations + pendingReviews)) * 100)
      : 0

  // ✅ Toggle edit form visibility and scroll into view
  const handleEditProfileToggle = () => {
    setShowEditProfileForm((prev) => !prev)
    setTimeout(() => {
      if (editProfileRef.current) {
        editProfileRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-700 dark:text-gray-300">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600" />
        <span className="ml-4">Loading your profile...</span>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gradient-to-br from-card/90 via-background to-card/90 backdrop-blur-xl text-foreground rounded-3xl shadow-2xl max-w-4xl mx-auto border border-border/50 transition-all duration-300 hover:shadow-3xl">
      <div className="flex flex-col sm:flex-row items-center sm:space-x-6 mb-8 border-b border-border/30 pb-6">
        <div className="w-28 h-28 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-primary via-accent to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-2xl sm:text-xl shadow-xl ring-4 ring-primary/20 transition-all duration-300 hover:scale-110">
          {currentUser?.name?.charAt(0) || "U"}
        </div>
        <div className="mt-6 sm:mt-0 text-center sm:text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {currentUser?.name || "Anonymous"}
          </h2>
          <p className="text-foreground/70 text-lg mt-1">{currentUser?.email || "Not Available"}</p>
          <p className="text-sm text-foreground/50 mt-2">Joined: {formattedDate}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-foreground/80 font-medium">Completed Annotations</span>
              <span className="text-2xl font-bold text-primary">{completedAnnotations}</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-2xl border border-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-foreground/80 font-medium">Pending Reviews</span>
              <span className="text-2xl font-bold text-accent">{pendingReviews}</span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-6 rounded-2xl border border-border/30">
          <p className="mb-4 font-semibold text-lg text-foreground">Progress Overview</p>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden shadow-inner">
            <div
              className="h-4 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-right text-foreground/60 mt-2 font-medium">{progressPercentage}% Complete</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
          <div className="w-full sm:w-auto">
            <button
              onClick={handleEditProfileToggle}
              className="w-full sm:w-auto px-6 py-3 border-2 border-primary/30 text-primary hover:bg-primary hover:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium backdrop-blur-sm"
            >
              {showEditProfileForm ? "Hide Edit Profile" : "Edit Profile"}
            </button>

            {showEditProfileForm && currentUser && (
              <div
                ref={editProfileRef}
                className="mt-6 p-6 bg-card/80 rounded-2xl border border-border/50 backdrop-blur-sm"
              >
                <EditProfileForm
                  user={currentUser}
                  onUpdate={() => {
                    fetchProfileData()
                    setShowEditProfileForm(false)
                  }}
                />
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl font-medium"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
