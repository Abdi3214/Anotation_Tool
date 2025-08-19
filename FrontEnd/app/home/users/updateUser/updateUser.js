"use client"

import { Activity, ArrowLeft, Lock, Mail, Shield, User } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function UpdateUser() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (!token || !user) {
      router.push("/login")
    }
  }, [])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [type, setType] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = searchParams.get("id") ?? ""
  const initialName = searchParams.get("name") ?? ""
  const initialEmail = searchParams.get("email") ?? ""
  const initialType = searchParams.get("type") ?? ""
  const initialIsActive = searchParams.get("isActive") === "true"

  useEffect(() => {
    setName(initialName)
    setEmail(initialEmail)
    setType(initialType)
    setIsActive(initialIsActive)
  }, [initialName, initialEmail, initialType, initialIsActive])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      name,
      email,
      userType: type,
      isActive: isActive,
    }

    if (password.trim()) {
      data.password = password // Include password only if user enters a new one
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/UpdateUsers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const text = await res.text()
        if (res.status === 409) {
          alert("This user already exists. Please try a different one.")
        } else {
          console.error(`Save failed: ${res.status} – ${text}`)
          alert("Failed to save user.")
        }
        return
      }

      await res.json()
      router.push("/home/users")
    } catch (error) {
      console.error("Error updating user:", error)
      alert("An error occurred while updating the user.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Users
          </button>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-card-foreground mb-2">User Profile Management</h1>
            <p className="text-muted-foreground">Update user information and permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg shadow-sm p-8 space-y-6">
          {/* Name (Disabled) */}
          <div className="space-y-2">
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <User size={16} className="text-muted-foreground" />
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              disabled
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed focus:outline-none"
            />
            <p className="text-xs text-muted-foreground">Name cannot be modified</p>
          </div>

          {/* Email (Disabled) */}
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Mail size={16} className="text-muted-foreground" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed focus:outline-none"
            />
            <p className="text-xs text-muted-foreground">Email cannot be modified</p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Lock size={16} className="text-muted-foreground" />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
          </div>

          {/* Type (Dropdown) */}
          <div className="space-y-2">
            <label htmlFor="type" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Shield size={16} className="text-muted-foreground" />
              User Role
            </label>
            <select
              id="type"
              value={type}
              required
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            >
              <option value="" disabled>
                Select user role
              </option>
              <option value="annotator">Annotator</option>
              <option value="Admin">Administrator</option>
            </select>
            <p className="text-xs text-muted-foreground">Choose the appropriate role for this user</p>
          </div>

          {/* Status (Dropdown) */}
          <div className="space-y-2">
            <label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Activity size={16} className="text-muted-foreground" />
              Account Status
            </label>
            <select
              id="status"
              value={isActive ? "true" : "false"}
              required
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {isActive ? "User can access the system" : "User access is disabled"}
            </p>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium px-6 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium px-6 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
