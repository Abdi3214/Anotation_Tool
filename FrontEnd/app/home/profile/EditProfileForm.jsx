"use client"
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { useState } from "react"

export default function EditProfileForm({ user, onUpdate }) {
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setMessageType("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Unauthorized")

      // Update profile info
      const resProfile = await fetch(`http://localhost:5000/api/users/UpdateUsers/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      })

      if (!resProfile.ok) {
        const errData = await resProfile.json()
        throw new Error(errData.message || "Failed to update profile")
      }

      // Update password if provided
      if (currentPassword && newPassword) {
        const resPassword = await fetch(`http://localhost:5000/api/users/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        })

        if (!resPassword.ok) {
          const errData = await resPassword.json()
          throw new Error(errData.error || "Failed to update password")
        }
      }

      if (onUpdate) await onUpdate() // refresh profile data
      setMessage("Profile updated successfully!")
      setMessageType("success")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      console.error(err)
      setMessage(err.message || "Error updating profile")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
            <p className="text-muted-foreground">Update your account information and security settings</p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Message */}
            {message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  messageType === "success"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            )}

            {/* Profile Information Section */}
            <div className="space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
                <p className="text-sm text-muted-foreground">Update your basic account details</p>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Change your password (leave blank to keep current password)
                </p>
              </div>

              {/* Current Password Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lock className="h-4 w-4" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password to change password"
                    className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lock className="h-4 w-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(user?.name || "")
                  setEmail(user?.email || "")
                  setCurrentPassword("")
                  setNewPassword("")
                  setMessage("")
                  setMessageType("")
                }}
                className="px-6 py-3 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Security Notice</p>
            <p>Your password is encrypted and secure. Only provide your current password when changing to a new one.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
