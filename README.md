# Vlookup Automation - Back-Office Hub

A production-ready Next.js + n8n demo for property management back-office automation, task management, and daily summaries.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (or use Supabase/Railway)
- n8n instance (self-hosted or cloud)

### 2. Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Fill in your environment variables:
DATABASE_URL=postgresql://user:password@localhost/vlookup
NEXT_PUBLIC_N8N_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
API_INTERNAL_TOKEN=demo-key-12345
NEXT_PUBLIC_API_KEY=demo-key-12345
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Development

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

### 5. Deploy to Vercel

```bash
vercel deploy
```

## 📋 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── tasks/           # Task CRUD endpoints
│   │   ├── clients/         # Client management
│   │   ├── users/           # User management
│   │   └── reports/         # Summary reports
│   ├── tasks/               # Task pages
│   ├── page.tsx             # Dashboard
│   └── layout.tsx           # Root layout
├── lib/
│   ├── prisma.ts           # Database client
│   ├── n8n.ts              # n8n webhook integration
│   └── helpers.ts          # Utility functions
├── types/
│   └── api.ts              # TypeScript interfaces
└── styles/
    └── globals.css         # Tailwind styles

prisma/
└── schema.prisma           # Database schema
```

## 🔌 API Endpoints

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user

### Reports
- `GET /api/reports/summary?date=YYYY-MM-DD` - Get daily summary

## 🤖 n8n Workflows

### Workflow 1: Task Created → Schedule Reminders
**Webhook Trigger:** `POST /webhook/task-created`

Receives:
```json
{
  "taskId": "...",
  "title": "Send rent reminder",
  "dueDate": "2026-05-30T10:00:00Z",
  "assignedToEmail": "agent@example.com",
  "clientName": "UK Property Client A",
  "priority": "HIGH"
}
```

Actions:
- IF task is urgent → send immediate email/Telegram
- ELSE → schedule reminder for `dueDate - 1 day`
- Email template: "Task `<title>` is due on `<dueDate>`"

### Workflow 2: Task Completed → Log to Google Sheet
**Webhook Trigger:** `POST /webhook/task-completed`

Receives:
```json
{
  "taskId": "...",
  "title": "Send rent reminder",
  "clientName": "UK Property Client A",
  "completedAt": "2026-05-28T14:30:00Z",
  "assignedToName": "John Agent"
}
```

Actions:
- Append row to Google Sheet (or Notion/Airtable)
- Format: Date | Task Title | Client | Assignee
- Auto-increment task counter

### Workflow 3: Daily 7 PM Summary → Manager Email
**Cron Trigger:** Daily at 19:00 IST

Actions:
- GET `/api/reports/summary?date=today`
- Parse: openTasks, overdueTasks, completedToday, tasksByClient
- Send email/Telegram/Slack to manager with:
  ```
  📊 Daily Ops Summary – May 27, 2026
  
  Open Tasks: 23
  Overdue: 5
  Completed Today: 12
  
  By Client:
  • UK Property A: 10 open, 2 overdue
  • London Rentals: 8 open, 1 overdue
  • ...
  ```

## 📊 Database Schema

### users
- `id` (UUID)
- `name`
- `email` (unique)
- `role` (`AGENT`, `MANAGER`, `ADMIN`)
- `createdAt`, `updatedAt`

### clients
- `id` (UUID)
- `name` (unique)
- `createdAt`, `updatedAt`

### tasks
- `id` (UUID)
- `title`, `description`
- `type` (`MAINTENANCE`, `RENT`, `FOLLOWUP`, `OTHER`)
- `status` (`OPEN`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- `dueDate`
- `clientId` (FK → clients)
- `assignedToId` (FK → users)
- `createdAt`, `updatedAt`

### task_events
- `id` (UUID)
- `eventType` (`CREATED`, `STATUS_CHANGED`, `ASSIGNED`, `REMINDER_SENT`, etc.)
- `metadata` (JSON)
- `taskId` (FK → tasks)
- `userId` (FK → users)
- `createdAt`

## 🛠️ Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# n8n
NEXT_PUBLIC_N8N_URL=http://localhost:5678
N8N_API_KEY=your-api-key

# Security
API_INTERNAL_TOKEN=demo-key-12345
NEXT_PUBLIC_API_KEY=demo-key-12345
```

## 🔐 Security

- API Key validation on webhook endpoints
- CORS headers configured for n8n
- Sensitive data excluded from client-side code
- Environment variables kept in `.env.local`

## 📝 Testing

### Manual Testing
1. Go to http://localhost:3000/tasks
2. Create a new task
3. Check n8n workflow execution
4. Update task status
5. View dashboard summary

### API Testing with cURL
```bash
# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "x-internal-token: demo-key-12345" \
  -d '{
    "title": "Send rent reminder",
    "type": "RENT",
    "clientId": "...",
    "dueDate": "2026-05-30",
    "priority": "HIGH"
  }'

# Get summary
curl http://localhost:3000/api/reports/summary?date=2026-05-27
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t vlookup-automation .
docker run -p 3000:3000 -e DATABASE_URL=... vlookup-automation
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org)
- [Prisma Docs](https://www.prisma.io/docs)
- [n8n Webhook Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [Tailwind CSS](https://tailwindcss.com)

## 🎯 Next Steps

1. **Add Authentication:** Integrate NextAuth for user login
2. **Email Templates:** Create branded email templates
3. **SMS Integration:** Add Twilio for SMS reminders
4. **Analytics:** Add PostHog or Mixpanel
5. **Audit Trail:** Log all user actions
6. **Notifications:** Real-time WebSocket updates
7. **AI Enhancement:** Use LLM for task suggestions

## 📞 Support

For issues or questions:
1. Check [n8n Community](https://community.n8n.io)
2. Review [Next.js Discord](https://discord.gg/bUG7V7H)
3. Open an issue on GitHub

---

**Built with** ❤️ **for property management teams**
