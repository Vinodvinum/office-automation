import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendWebhookEvent } from "@/lib/n8n"
import { validateApiKey, formatTaskPayload } from "@/lib/helpers"
import type { CreateTaskRequest } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")

    const where: any = {}

    if (status) where.status = status
    if (clientId) where.clientId = clientId

    if (fromDate || toDate) {
      where.dueDate = {}
      if (fromDate) where.dueDate.gte = new Date(fromDate)
      if (toDate) where.dueDate.lte = new Date(toDate)
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: true,
        assignedTo: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("GET /api/tasks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-internal-token")
    if (!validateApiKey(apiKey || undefined)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = (await request.json()) as CreateTaskRequest

    // Validate required fields
    if (!body.title || !body.clientId || !body.dueDate || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        priority: body.priority || "MEDIUM",
        dueDate: new Date(body.dueDate),
        clientId: body.clientId,
        assignedToId: body.assignedToId,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    })

    // Create task event
    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        eventType: "CREATED",
        userId: body.assignedToId || "system",
        metadata: {
          title: task.title,
          priority: task.priority,
        },
      },
    })

    // Send webhook to n8n
    const webhookPayload = formatTaskPayload(task, task.client, task.assignedTo)
    await sendWebhookEvent("/task-created", webhookPayload)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("POST /api/tasks error:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
