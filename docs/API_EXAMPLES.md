# API Payload Examples & Testing

## Authentication

All mutating endpoints require API key header:
```
x-internal-token: demo-key-12345
```

## Task Endpoints

### 1. Create Task

**Request:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "x-internal-token: demo-key-12345" \
  -d '{
    "title": "Send rent reminder – Flat 301",
    "description": "Send reminder email to tenant for May rent",
    "type": "RENT",
    "priority": "HIGH",
    "dueDate": "2026-05-30T10:00:00Z",
    "clientId": "client-uuid-123",
    "assignedToId": "user-uuid-456"
  }'
```

**Response (201):**
```json
{
  "id": "task-uuid-789",
  "title": "Send rent reminder – Flat 301",
  "description": "Send reminder email to tenant for May rent",
  "type": "RENT",
  "status": "OPEN",
  "priority": "HIGH",
  "dueDate": "2026-05-30T10:00:00Z",
  "clientId": "client-uuid-123",
  "client": {
    "id": "client-uuid-123",
    "name": "UK Property Management"
  },
  "assignedToId": "user-uuid-456",
  "assignedTo": {
    "id": "user-uuid-456",
    "name": "John Smith",
    "email": "john@company.com"
  },
  "createdAt": "2026-05-27T14:30:00Z",
  "updatedAt": "2026-05-27T14:30:00Z"
}
```

### 2. Get Tasks (with filters)

**Request:**
```bash
# Get all open tasks
curl "http://localhost:3000/api/tasks?status=OPEN"

# Get tasks for specific client
curl "http://localhost:3000/api/tasks?clientId=client-uuid-123"

# Get tasks in date range
curl "http://localhost:3000/api/tasks?from=2026-05-01&to=2026-05-31"

# Combine filters
curl "http://localhost:3000/api/tasks?status=OPEN&clientId=client-uuid-123"
```

**Response (200):**
```json
[
  {
    "id": "task-uuid-789",
    "title": "Send rent reminder – Flat 301",
    "type": "RENT",
    "status": "OPEN",
    "priority": "HIGH",
    "dueDate": "2026-05-30T10:00:00Z",
    "clientId": "client-uuid-123",
    "client": {
      "id": "client-uuid-123",
      "name": "UK Property Management"
    },
    "assignedToId": "user-uuid-456",
    "assignedTo": {
      "id": "user-uuid-456",
      "name": "John Smith",
      "email": "john@company.com"
    },
    "createdAt": "2026-05-27T14:30:00Z",
    "updatedAt": "2026-05-27T14:30:00Z"
  }
]
```

### 3. Get Task Details

**Request:**
```bash
curl "http://localhost:3000/api/tasks/task-uuid-789"
```

**Response (200):**
```json
{
  "id": "task-uuid-789",
  "title": "Send rent reminder – Flat 301",
  "description": "Send reminder email to tenant for May rent",
  "type": "RENT",
  "status": "OPEN",
  "priority": "HIGH",
  "dueDate": "2026-05-30T10:00:00Z",
  "clientId": "client-uuid-123",
  "client": {
    "id": "client-uuid-123",
    "name": "UK Property Management"
  },
  "assignedToId": "user-uuid-456",
  "assignedTo": {
    "id": "user-uuid-456",
    "name": "John Smith",
    "email": "john@company.com"
  },
  "taskEvents": [
    {
      "id": "event-uuid-001",
      "eventType": "CREATED",
      "metadata": {
        "title": "Send rent reminder – Flat 301",
        "priority": "HIGH"
      },
      "createdAt": "2026-05-27T14:30:00Z"
    }
  ],
  "createdAt": "2026-05-27T14:30:00Z",
  "updatedAt": "2026-05-27T14:30:00Z"
}
```

### 4. Update Task

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/tasks/task-uuid-789 \
  -H "Content-Type: application/json" \
  -H "x-internal-token: demo-key-12345" \
  -d '{
    "status": "IN_PROGRESS",
    "priority": "MEDIUM"
  }'
```

**Response (200):**
```json
{
  "id": "task-uuid-789",
  "title": "Send rent reminder – Flat 301",
  "type": "RENT",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "dueDate": "2026-05-30T10:00:00Z",
  "clientId": "client-uuid-123",
  "client": {
    "id": "client-uuid-123",
    "name": "UK Property Management"
  },
  "assignedToId": "user-uuid-456",
  "assignedTo": {
    "id": "user-uuid-456",
    "name": "John Smith",
    "email": "john@company.com"
  },
  "updatedAt": "2026-05-27T15:00:00Z"
}
```

**Mark as Complete (triggers webhook):**
```bash
curl -X PATCH http://localhost:3000/api/tasks/task-uuid-789 \
  -H "Content-Type: application/json" \
  -H "x-internal-token: demo-key-12345" \
  -d '{
    "status": "COMPLETED"
  }'
```

### 5. Delete Task

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/task-uuid-789 \
  -H "x-internal-token: demo-key-12345"
```

**Response (200):**
```json
{
  "success": true
}
```

## Client Endpoints

### Get Clients

**Request:**
```bash
curl "http://localhost:3000/api/clients"
```

**Response (200):**
```json
[
  {
    "id": "client-uuid-123",
    "name": "UK Property Management",
    "createdAt": "2026-05-20T10:00:00Z",
    "updatedAt": "2026-05-20T10:00:00Z"
  },
  {
    "id": "client-uuid-124",
    "name": "London Rentals",
    "createdAt": "2026-05-21T11:00:00Z",
    "updatedAt": "2026-05-21T11:00:00Z"
  }
]
```

### Create Client

**Request:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Property Company"
  }'
```

**Response (201):**
```json
{
  "id": "client-uuid-125",
  "name": "New Property Company",
  "createdAt": "2026-05-27T16:00:00Z",
  "updatedAt": "2026-05-27T16:00:00Z"
}
```

## User Endpoints

### Get Users

**Request:**
```bash
curl "http://localhost:3000/api/users"
```

**Response (200):**
```json
[
  {
    "id": "user-uuid-456",
    "name": "John Smith",
    "email": "john@company.com",
    "role": "AGENT",
    "createdAt": "2026-05-20T10:00:00Z",
    "updatedAt": "2026-05-20T10:00:00Z"
  },
  {
    "id": "user-uuid-457",
    "name": "Sarah Manager",
    "email": "sarah@company.com",
    "role": "MANAGER",
    "createdAt": "2026-05-21T11:00:00Z",
    "updatedAt": "2026-05-21T11:00:00Z"
  }
]
```

### Create User

**Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Agent",
    "email": "agent@company.com",
    "role": "AGENT"
  }'
```

**Response (201):**
```json
{
  "id": "user-uuid-458",
  "name": "New Agent",
  "email": "agent@company.com",
  "role": "AGENT",
  "createdAt": "2026-05-27T16:00:00Z",
  "updatedAt": "2026-05-27T16:00:00Z"
}
```

## Reports Endpoints

### Get Daily Summary

**Request:**
```bash
# Today's summary
curl "http://localhost:3000/api/reports/summary"

# Specific date
curl "http://localhost:3000/api/reports/summary?date=2026-05-27"
```

**Response (200):**
```json
{
  "date": "2026-05-27",
  "openTasks": 23,
  "overdueTasks": 5,
  "completedToday": 12,
  "tasksByClient": [
    {
      "clientName": "UK Property Management",
      "open": 10,
      "overdue": 2,
      "completed": 5
    },
    {
      "clientName": "London Rentals",
      "open": 8,
      "overdue": 1,
      "completed": 4
    },
    {
      "clientName": "Birmingham Properties",
      "open": 5,
      "overdue": 2,
      "completed": 3
    }
  ]
}
```

## Webhook Payloads (from Next.js → n8n)

### Task Created Webhook

**When:** Task is created via `POST /api/tasks`
**URL:** `http://your-n8n.com/webhook/task-created`

**Payload:**
```json
{
  "taskId": "task-uuid-789",
  "title": "Send rent reminder – Flat 301",
  "type": "RENT",
  "dueDate": "2026-05-30T10:00:00Z",
  "priority": "HIGH",
  "clientName": "UK Property Management",
  "assignedToEmail": "john@company.com",
  "assignedToName": "John Smith"
}
```

### Task Completed Webhook

**When:** Task status changed to COMPLETED
**URL:** `http://your-n8n.com/webhook/task-completed`

**Payload:**
```json
{
  "taskId": "task-uuid-789",
  "title": "Send rent reminder – Flat 301",
  "clientName": "UK Property Management",
  "completedAt": "2026-05-27T15:30:00Z",
  "assignedToName": "John Smith"
}
```

## Error Responses

### Unauthorized (401)
```json
{
  "error": "Unauthorized"
}
```

### Bad Request (400)
```json
{
  "error": "Missing required fields"
}
```

### Not Found (404)
```json
{
  "error": "Task not found"
}
```

### Server Error (500)
```json
{
  "error": "Failed to create task"
}
```

## Testing Script (Postman/Insomnia)

Import into Postman:
```json
{
  "info": {
    "name": "Vlookup API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Task",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/tasks",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "x-internal-token", "value": "{{api_key}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"title\":\"Test Task\",\"type\":\"RENT\",\"clientId\":\"client-123\",\"dueDate\":\"2026-05-30\"}"
        }
      }
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:3000"},
    {"key": "api_key", "value": "demo-key-12345"}
  ]
}
```
