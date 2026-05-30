import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay } from "date-fns"
import { isOverdue } from "@/lib/helpers"
import type { SummaryReportResponse } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]
    const date = new Date(dateParam)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    // Get all tasks for this date
    const tasks = await prisma.task.findMany({
      include: {
        client: true,
      },
    })

    // Calculate metrics
    let openCount = 0
    let overdueCount = 0
    let completedTodayCount = 0
    const clientMetrics: { [key: string]: { open: number; overdue: number; completed: number } } = {}

    for (const task of tasks) {
      const clientName = task.client?.name || "Unknown"

      if (!clientMetrics[clientName]) {
        clientMetrics[clientName] = { open: 0, overdue: 0, completed: 0 }
      }

      if (task.status === "COMPLETED") {
        if (task.updatedAt >= dayStart && task.updatedAt <= dayEnd) {
          completedTodayCount++
          clientMetrics[clientName].completed++
        }
      } else {
        openCount++
        clientMetrics[clientName].open++

        if (isOverdue(task.dueDate)) {
          overdueCount++
          clientMetrics[clientName].overdue++
        }
      }
    }

    const response: SummaryReportResponse = {
      date: dateParam,
      openTasks: openCount,
      overdueTasks: overdueCount,
      completedToday: completedTodayCount,
      tasksByClient: Object.entries(clientMetrics).map(([clientName, metrics]) => ({
        clientName,
        ...metrics,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("GET /api/reports/summary error:", error)
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    )
  }
}
