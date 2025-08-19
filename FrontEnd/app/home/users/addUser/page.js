"use client"
import { ArrowLeft, Lock, Mail, Shield, User, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

function AddUser() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (!token || !user) {
      router.push("/login")
    }
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    const data = {
      name: name.trim(),
      email: email.trim(),
      password,
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/addUsers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const text = await res.text()
        if (res.status === 409) {
          setErrors({ email: "This email is already registered. Please use a different email." })
        } else {
          console.error(`Save failed: ${res.status} ${res.statusText} - ${text}`)
          setErrors({ general: "Failed to create user. Please try again." })
        }
        return
      }

      const result = await res.json()
      console.log("Created user:", result)
      router.push("/home/users")
    } catch (error) {
      console.error("Network error:", error)
      setErrors({ general: "Network error. Please check your connection and try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Add New User</h1>
          <p className="text-muted-foreground">Create a new user account for the system</p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }))
                }}
                className={`w-full px-3 py-2 bg-input border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  errors.name ? "border-destructive focus:ring-destructive/50" : "border-border"
                }`}
                placeholder="Enter full name"
                disabled={isLoading}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                }}
                className={`w-full px-3 py-2 bg-input border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  errors.email ? "border-destructive focus:ring-destructive/50" : "border-border"
                }`}
                placeholder="Enter email address"
                disabled={isLoading}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                }}
                className={`w-full px-3 py-2 bg-input border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  errors.password ? "border-destructive focus:ring-destructive/50" : "border-border"
                }`}
                placeholder="Enter secure password"
                disabled={isLoading}
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/home/users")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border text-card-foreground bg-background hover:bg-muted/50 rounded-md transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            User accounts are created with default permissions. Update roles and permissions after creation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AddUser
