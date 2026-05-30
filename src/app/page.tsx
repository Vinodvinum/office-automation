"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format, isAfter, startOfDay } from "date-fns"
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react"

interface KPIData {
  date: string
  openTasks: number
  overdueTasks: number
  completedToday: number
  tasksByClient: Array<{
    clientName: string
    open: number
    overdue: number
    completed: number
  }>
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  async function fetchDashboard() {
    try {
      const today = new Date().toISOString().split("T")[0]
      const res = await fetch(`/api/reports/summary?date=${today}`)
      const data = await res.json()
      setKpi(data)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time ops overview for {format(new Date(), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Open Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Open Tasks</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {kpi?.openTasks || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Requires attention and follow-up
            </p>
          </div>

          {/* Overdue Tasks */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue Tasks</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {kpi?.overdueTasks || 0}
                </p>
              </div>
              <div className="bg-red-100 rounded-lg p-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Urgent attention needed
            </p>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed Today</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {kpi?.completedToday || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Great progress today
            </p>
          </div>
        </div>

        {/* Tasks by Client */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Tasks by Client
          </h2>

          {kpi?.tasksByClient && kpi.tasksByClient.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Open
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Overdue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Completed Today
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {kpi.tasksByClient.map((client) => (
                    <tr key={client.clientName} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {client.clientName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {client.open}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {client.overdue}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {client.completed}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {client.overdue > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            Needs Attention
                          </span>
                        ) : client.open > 0 ? (
                          <span className="text-blue-600">On Track</span>
                        ) : (
                          <span className="text-green-600">All Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No clients found
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/tasks"
                className="block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                View All Tasks
              </Link>
              <Link
                href="/tasks?status=OPEN"
                className="block px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
              >
                View Open Tasks
              </Link>
              <button
                onClick={() => window.location.href = "/tasks?status=IN_PROGRESS"}
                className="block w-full text-left px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
              >
                View In Progress
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-slate-600">API Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-slate-600">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">n8n Webhooks</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
