import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { sendWebhookEvent } from "@/lib/n8n"
import { validateApiKey } from "@/lib/helpers"
import type { UpdateTaskRequest } from "@/types/api"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        assignedTo: true,
        taskEvents: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error(`GET /api/tasks/${params.id} error:`, error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get("x-internal-token")
    if (!validateApiKey(apiKey || undefined)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = (await request.json()) as UpdateTaskRequest

    // Get current task
    const currentTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        assignedTo: true,
      },
    })

    if (!currentTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    const previousStatus = currentTask.status
    const statusChanged = body.status && body.status !== previousStatus

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        assignedToId: body.assignedToId === null ? null : body.assignedToId,
      },
      include: {
        client: true,
        assignedTo: true,
      },
    })

    // Log event
    const eventType = body.status === "COMPLETED" ? "COMPLETED" : statusChanged ? "STATUS_CHANGED" : body.assignedToId ? "ASSIGNED" : "STATUS_CHANGED"

    // Determine a valid userId for the event. Prefer provided user, then assigned user, then any existing user.
    let eventUserId = (body as any).userId || currentTask.assignedToId
    if (!eventUserId) {
      const fallbackUser = await prisma.user.findFirst()
      eventUserId = fallbackUser?.id || currentTask.assignedToId
    }

    if (!eventUserId) {
      throw new Error("No valid user available to attribute task event")
    }

    await prisma.taskEvent.create({
      data: {
        taskId: params.id,
        eventType: eventType as any,
        userId: eventUserId,
        metadata: {
          previousStatus,
          newStatus: body.status,
          changes: JSON.parse(JSON.stringify(body)) as Prisma.InputJsonValue,
        },
      },
    })

    // Send webhook if completed
    if (body.status === "COMPLETED") {
      const webhookPayload = {
        taskId: updatedTask.id,
        title: updatedTask.title,
        clientName: updatedTask.client?.name || "Unknown",
        completedAt: new Date().toISOString(),
        assignedToName: updatedTask.assignedTo?.name,
      }
      await sendWebhookEvent("/task-completed", webhookPayload)
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error(`PATCH /api/tasks/${params.id} error:`, error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get("x-internal-token")
    if (!validateApiKey(apiKey || undefined)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/tasks/${params.id} error:`, error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
