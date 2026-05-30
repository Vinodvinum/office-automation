import { differenceInDays, isAfter, startOfDay } from "date-fns"

export function isOverdue(dueDate: Date): boolean {
  const today = startOfDay(new Date())
  return isAfter(today, startOfDay(dueDate))
}

export function daysUntilDue(dueDate: Date): number {
  return differenceInDays(startOfDay(dueDate), startOfDay(new Date()))
}

export function isUrgent(dueDate: Date): boolean {
  return daysUntilDue(dueDate) <= 1
}

export function validateApiKey(apiKey: string | undefined): boolean {
  const expectedKey = process.env.API_INTERNAL_KEY || process.env.API_INTERNAL_TOKEN || "demo-key-12345"
  return apiKey === expectedKey
}

export function formatTaskPayload(task: any, client: any, assignedTo: any) {
  return {
    taskId: task.id,
    title: task.title,
    type: task.type,
    dueDate: task.dueDate.toISOString(),
    priority: task.priority,
    clientName: client?.name || "Unknown",
    assignedToEmail: assignedTo?.email,
    assignedToName: assignedTo?.name,
  }
}
