"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, isAfter, startOfDay } from "date-fns"
import { AlertCircle, CheckCircle, Clock, Plus } from "lucide-react"

interface Task {
  id: string
  title: string
  type: string
  status: string
  priority: string
  dueDate: string
  client: { id: string; name: string }
  assignedTo?: { id: string; name: string; email: string }
}

interface Client {
  id: string
  name: string
}

export default function TasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "",
    clientId: "",
  })
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchClients()
  }, [filters])

  async function fetchTasks() {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append("status", filters.status)
      if (filters.clientId) params.append("clientId", filters.clientId)

      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    }
  }

  const isOverdue = (dueDate: string) => {
    const today = startOfDay(new Date())
    return isAfter(today, startOfDay(new Date(dueDate)))
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 font-bold"
      case "HIGH":
        return "text-orange-600 font-semibold"
      case "MEDIUM":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "COMPLETED") return <CheckCircle className="w-4 h-4" />
    if (status === "OPEN" || status === "IN_PROGRESS") return <Clock className="w-4 h-4" />
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your back-office operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-2 btn-primary"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">Back to Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Client</label>
              <select
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No tasks found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
                          {task.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{task.client.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{task.type}</td>
                      <td className={`px-6 py-4 text-sm ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          {isOverdue(task.dueDate) && task.status !== "COMPLETED" && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{task.assignedTo?.name || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <NewTaskModal
          clients={clients}
          onClose={() => setShowNewTaskModal(false)}
          onSuccess={() => {
            setShowNewTaskModal(false)
            fetchTasks()
          }}
        />
      )}
    </div>
  )
}

function NewTaskModal({
  clients,
  onClose,
  onSuccess,
}: {
  clients: Client[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "MAINTENANCE",
    clientId: clients[0]?.id || "",
    dueDate: "",
    priority: "MEDIUM",
    description: "",
  })
  const [loading, setLoading] = useState(false)

      async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
              "x-internal-token": process.env.NEXT_PUBLIC_API_INTERNAL_TOKEN || "demo-key-12345",
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to create task")

      onSuccess()
    } catch (error) {
      console.error("Failed to create task:", error)
      alert("Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Send rent reminder"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RENT">Rent</option>
                <option value="FOLLOWUP">Follow-up</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
