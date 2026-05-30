// API Request/Response types
export interface CreateTaskRequest {
  title: string
  description?: string
  type: "MAINTENANCE" | "RENT" | "FOLLOWUP" | "OTHER"
  dueDate: string // ISO date string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  clientId: string
  assignedToId?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: string
  assignedToId?: string | null
}

export interface TaskResponse {
  id: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  dueDate: string
  clientId: string
  client?: {
    id: string
    name: string
  }
  assignedToId?: string
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface SummaryReportResponse {
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

// Webhook payload types
export interface TaskCreatedWebhook {
  taskId: string
  title: string
  type: string
  dueDate: string
  assignedToEmail?: string
  clientName: string
  priority: string
}

export interface TaskCompletedWebhook {
  taskId: string
  title: string
  clientName: string
  completedAt: string
  assignedToName?: string
}
