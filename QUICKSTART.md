# 🚀 Quick Start Guide

## Installation (2 minutes)

```bash
cd e:\vin\Vlookup

# 1. Install dependencies
npm install

# 2. Copy and configure environment file
cp .env.example .env.local

# 3. Update DATABASE_URL in .env.local
# Use: postgresql://user:password@host/dbname
# or get from Supabase/Railway
```

## Database Setup (5 minutes)

### Option A: Supabase (Easiest)
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string (URI)
4. Copy and paste into `DATABASE_URL` in `.env.local`

### Option B: Local PostgreSQL
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb vlookup

# Add to .env.local:
# DATABASE_URL=postgresql://localhost/vlookup
```

### Initialize Database
```bash
npx prisma db push
```

## Run Locally (3 minutes)

```bash
npm run dev
```

Open browser: http://localhost:3000

## First Steps

### Create Test Data

```bash
# Add a client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Property Co"}'

# Add a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Agent","email":"john@test.com","role":"AGENT"}'

# Create a task (replace IDs from responses above)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "x-internal-token: demo-key-12345" \
  -d '{
    "title":"Send rent reminder",
    "type":"RENT",
    "priority":"HIGH",
    "dueDate":"2026-06-01",
    "clientId":"<client-id>",
    "assignedToId":"<user-id>"
  }'
```

### Visit Dashboard
http://localhost:3000 → See KPI cards with tasks

### View Tasks
http://localhost:3000/tasks → See task list, create new tasks

### Check API
http://localhost:3000/api/reports/summary → See JSON response

## Connect n8n (Optional for demo)

```bash
# Start n8n locally (if not already running)
docker run -d -p 5678:5678 n8nio/n8n

# Visit: http://localhost:5678
# Create test webhook workflows using docs/N8N_WORKFLOWS.md
```

## Deploy to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables when prompted:
# DATABASE_URL, NEXT_PUBLIC_N8N_URL, API_INTERNAL_TOKEN, etc.

# Redeploy with production config
vercel --prod
```

## File Structure Overview

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/        # Task CRUD
│   │   ├── clients/      # Client mgmt
│   │   ├── users/        # User mgmt
│   │   └── reports/      # Summary API
│   ├── tasks/            # Task pages
│   ├── page.tsx          # Dashboard
│   └── layout.tsx        # Layout
├── lib/
│   ├── prisma.ts        # DB client
│   ├── n8n.ts           # n8n integration
│   └── helpers.ts       # Utilities
├── types/
│   └── api.ts           # Type definitions
└── styles/
    └── globals.css      # Tailwind

docs/
├── DATABASE_SETUP.md    # DB config guide
├── N8N_WORKFLOWS.md     # Workflow templates
├── API_EXAMPLES.md      # API testing
└── PITCH.md            # Sales pitch
```

## Documentation

- **Setup:** See `docs/DATABASE_SETUP.md`
- **API Testing:** See `docs/API_EXAMPLES.md`
- **n8n Workflows:** See `docs/N8N_WORKFLOWS.md`
- **Pitch Deck:** See `docs/PITCH.md`

## Troubleshooting

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Check `DATABASE_URL` is correct and PostgreSQL is running

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### n8n webhook not triggering
1. Check webhook path matches exactly
2. Verify n8n is running on correct port
3. Check n8n logs: http://localhost:5678

### Prisma schema errors
```bash
# Reset database and schema
npx prisma db push --force-reset
```

## Next Steps

1. ✅ Run locally and explore UI
2. ✅ Create test tasks via API
3. ✅ Set up n8n workflows (see docs/N8N_WORKFLOWS.md)
4. ✅ Configure real database (Supabase)
5. ✅ Deploy to Vercel
6. ✅ Add authentication (NextAuth)
7. ✅ Customize for your use case

## Need Help?

- 📖 [Next.js Docs](https://nextjs.org)
- 📖 [Prisma Docs](https://www.prisma.io/docs)
- 📖 [n8n Docs](https://docs.n8n.io)
- 💬 [n8n Community](https://community.n8n.io)

---

**Ready?** Run `npm run dev` and start building! 🚀
