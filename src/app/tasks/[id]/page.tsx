"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Save, Trash2 } from "lucide-react"

interface Task {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  dueDate: string
  clientId: string
  client: { id: string; name: string }
  assignedTo?: { id: string; name: string; email: string }
  taskEvents: any[]
  createdAt: string
  updatedAt: string
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    dueDate: "",
  })

  useEffect(() => {
    fetchTask()
  }, [])

  async function fetchTask() {
    try {
      const res = await fetch(`/api/tasks/${taskId}`)
      const data = await res.json()
      setTask(data)
      setFormData({
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate.split("T")[0],
      })
    } catch (error) {
      console.error("Failed to fetch task:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!task) return

    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
                headers: {
          "Content-Type": "application/json",
          "x-internal-token": process.env.NEXT_PUBLIC_API_INTERNAL_TOKEN || "demo-key-12345",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update task")

      const updated = await res.json()
      setTask(updated)
      setEditMode(false)
    } catch (error) {
      console.error("Failed to update task:", error)
      alert("Failed to update task")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "x-internal-token": process.env.NEXT_PUBLIC_API_INTERNAL_TOKEN || "demo-key-12345",
        },
      })

      if (!res.ok) throw new Error("Failed to delete task")

      router.push("/tasks")
    } catch (error) {
      console.error("Failed to delete task:", error)
      alert("Failed to delete task")
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>
  }

  if (!task) {
    return <div className="p-8 text-center text-slate-500">Task not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false)
                    fetchTask()
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {task.title}
                  </h1>
                  {task.description && (
                    <p className="text-slate-600 mb-4">{task.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        Type
                      </p>
                      <p className="text-slate-900">{task.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        Priority
                      </p>
                      <p className="text-slate-900">{task.priority}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        Status
                      </p>
                      <p className="text-slate-900">{task.status}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        Due Date
                      </p>
                      <p className="text-slate-900">
                        {format(new Date(task.dueDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">
                    Client
                  </p>
                  <p className="text-slate-900">{task.client.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">
                    Assigned To
                  </p>
                  <p className="text-slate-900">
                    {task.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">
                    Created
                  </p>
                  <p className="text-slate-900">
                    {format(new Date(task.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">
                    Updated
                  </p>
                  <p className="text-slate-900">
                    {format(new Date(task.updatedAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Activity</h3>
              <div className="space-y-2 text-sm">
                {task.taskEvents.length === 0 ? (
                  <p className="text-slate-500">No events yet</p>
                ) : (
                  task.taskEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="pb-2 border-b border-slate-100">
                      <p className="font-medium text-slate-900">{event.eventType}</p>
                      <p className="text-xs text-slate-500">
                        {format(
                          new Date(event.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
