"use client"

import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const SavedPage = () => {
  const router = useRouter()
  const [savedText, setSavedText] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userToken, setUserToken] = useState(null)

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30"
      case "In Progress":
        return "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/30"
      case "Completed":
        return "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 dark:text-green-400 border border-green-500/30"
      case "Skipped":
        return "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 dark:text-gray-400 border border-gray-500/30"
      default:
        return "bg-gradient-to-r from-muted/50 to-muted/70 text-foreground border border-border/50"
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      router.push("/login")
    } else {
      setUserToken(token)
    }
  }, [router])

  const fetchSavedText = async () => {
    if (!userToken) return

    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/annotation/Allassigned", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch assignments")
      const data = await res.json()
      setSavedText(data)
    } catch (err) {
      console.error("Error fetching assigned texts:", err)
      setSavedText([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSavedText()
  }, [userToken])

  const startAnnotation = (id, source) => {
    localStorage.setItem("startSrc", source)
    localStorage.setItem("startedFromAssigned", "true")
    router.push("/home/annotation")
  }

  if (savedText === null) {
    return (
      <main className="min-h-screen  bg-gradient-to-br from-background via-muted/20 to-background py-10 px-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <span className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Loading...
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-10 px-4">
      <div className="max-w-7xl mx-auto bg-card/90 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
        <div className="px-8 py-8 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Saved Annotations
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Review or continue your assigned texts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm sm:text-base">
            <thead className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
              <tr>
                {["Text ID", "Email", "Source", "Due Date", "Status", "Action"].map((header) => (
                  <th key={header} className="px-6 py-4 border-b border-border/30 text-left font-bold text-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center px-6 py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : savedText.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center px-6 py-12 text-muted-foreground">
                    No assigned texts found.
                  </td>
                </tr>
              ) : (
                savedText.map((item, index) => {
                  const displayStatus = item.Skipped ? "Skipped" : item.status || "Pending"

                  return (
                    <tr
                      key={item._id}
                      className="group hover:bg-card/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 border-b border-border/20 font-medium">{item._id}</td>
                      <td className="px-6 py-4 border-b border-border/20">{item.email}</td>
                      <td className="px-6 py-4 border-b border-border/20 max-w-sm">
                        <div className="truncate group-hover:text-primary transition-colors duration-300">
                          {item.source}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-border/20">{item.due}</td>
                      <td className="px-6 py-4 border-b border-border/20">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${getStatusStyle(displayStatus)}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-border/20">
                        <button
                          onClick={() => startAnnotation(item._id, item.source)}
                          className="group/btn p-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <Pencil size={18} className="transition-transform duration-300 group-hover/btn:rotate-12" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default SavedPage
