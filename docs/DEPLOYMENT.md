# Deployment Guide - Production Ready

## Pre-Deployment Checklist

- [ ] Database setup (Supabase/Railway)
- [ ] Environment variables configured
- [ ] n8n instance set up and workflows created
- [ ] API key tokens generated
- [ ] Email configuration (if using Gmail SMTP)
- [ ] GitHub repository created and code pushed
- [ ] Vercel account created

## Step 1: Database (Supabase Recommended)

### Create Supabase Project
1. Go to https://supabase.com → Sign up
2. Create new project
3. Choose region closest to users
4. Wait for project to initialize (2-3 min)

### Get Connection String
1. Settings → Database → Connection string → URI
2. Copy the string (looks like: `postgresql://postgres.xxxxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres`)

### Update Environment
```env
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres
```

### Push Schema
```bash
npx prisma db push
```

## Step 2: n8n Setup

### Option A: n8n Cloud (Recommended for MVP)
1. Go to https://n8n.cloud
2. Create account
3. Create new workflow for each of the 3 workflows (see docs/N8N_WORKFLOWS.md)
4. Get API endpoint: Settings → API Keys
5. Get webhook URLs from workflow details

### Option B: Self-Hosted n8n
```bash
# Docker Compose with persistent DB
cat > docker-compose.yml << 'EOF'
version: '3'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: n8n-secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  n8n:
    image: n8nio/n8n:latest
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRE_HOST=postgres
      - DB_POSTGRE_PORT=5432
      - DB_POSTGRE_DATABASE=n8n
      - DB_POSTGRE_USER=n8n
      - DB_POSTGRE_PASSWORD=n8n-secure-password
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
    ports:
      - "5678:5678"
    depends_on:
      - postgres
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  postgres_data:
  n8n_data:
EOF

docker-compose up -d
```

Visit: http://your-server:5678

## Step 3: GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Vlookup automation demo"

# Create GitHub repo and push
git remote add origin https://github.com/your-username/vlookup-automation.git
git branch -M main
git push -u origin main
```

**Add .gitignore:**
```
node_modules/
.env.local
.env.production.local
.next/
dist/
out/
```

## Step 4: Deploy to Vercel

### Option A: Vercel CLI (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

During deployment, Vercel will:
- Build Next.js app
- Ask for environment variables
- Deploy to global CDN

### Option B: Vercel Dashboard
1. Go to https://vercel.com → New Project
2. Connect GitHub repo
3. Import project
4. Add environment variables in Settings
5. Deploy

### Environment Variables in Vercel

Go to **Settings → Environment Variables** and add:

```
DATABASE_URL = postgresql://...
NEXT_PUBLIC_N8N_URL = https://your-n8n-instance.com
N8N_API_KEY = your-api-key
API_INTERNAL_TOKEN = your-secure-token
NEXT_PUBLIC_API_INTERNAL_TOKEN = your-secure-token
```

If you still see `localhost:5678` in your deployment, replace it with the public n8n URL above. The frontend uses `NEXT_PUBLIC_N8N_URL` at runtime.

## Step 4.5: Backend Hosting Options (choose one)

Depending on your preference you can host the backend API (Prisma + Next.js API routes or a lightweight Node server) on Render, Railway, or use Supabase Edge Functions. Below are concise, tested recipes for each option.

### Option A — Render (Web Service)

- Create a new **Web Service** on Render and connect your GitHub repo.
- Set the Build Command to:

```bash
npm ci && npx prisma generate && npm run build
```

- Set the Start Command to:

```bash
npm run start
```

- Environment variables (add in Render _Environment_ section):

```
DATABASE_URL=postgresql://...    # production DB (Supabase/RDS)
DIRECT_URL=postgresql://...      # optional, if using Prisma Data Proxy or Direct URL
API_INTERNAL_TOKEN=your-secure-token
NEXT_PUBLIC_API_INTERNAL_TOKEN=your-public-demo-token
NEXT_PUBLIC_N8N_URL=https://your-n8n-instance.com
```

- Render will build and start your Next app as a Node server. Ensure you have `start` script in `package.json` (this repo has `next start`).

### Option B — Railway

- Create a new project on Railway and link your GitHub repo (Deploy from GitHub).
- Railway build command (project settings):

```bash
npm ci && npx prisma generate && npm run build
```

- Railway start command:

```bash
npm run start
```

- Add environment variables in Railway's dashboard (same list as Render).
- Railway provides managed Postgres — you can either provision a Railway Postgres DB and set `DATABASE_URL`, or use Supabase and paste its URL.

### Option C — Supabase (DB + Edge Functions)

Use Supabase for the database and optionally deploy serverless Edge Functions for lightweight API endpoints. This is best if you want a serverless, regional API close to the DB.

- Provision a Supabase project and copy the `DATABASE_URL` as shown earlier.
- Deploy Edge Functions (JavaScript/TypeScript) to handle small webhook endpoints or offload expensive work to background jobs.

Example Edge Function flow:

1. Move lightweight endpoints to `supabase/functions/` as single-purpose handlers (e.g., webhook receivers).
2. Use `supabase` CLI to deploy:

```bash
npm i -g supabase
supabase login
supabase functions deploy task-created --project-ref your-ref
```

3. For Prisma-backed APIs keep them on Render/Railway (Prisma and migrations expect a Node environment).

### Prisma & Migrations (production)

- For any production host running Prisma, run migrations (or `db push`) during build or as a release step:

```bash
# Generate client
npx prisma generate

# Apply migrations (if you use migrations)
npx prisma migrate deploy

# Or push schema without migrations (idempotent)
npx prisma db push
```

- If you prefer zero-downtime deployment, run `prisma migrate deploy` as a one-time release job rather than during build.

### Notes on Secrets & Environment

- Keep `DATABASE_URL` and any tokens out of the frontend public envs. Only prefix values intended for client-side use with `NEXT_PUBLIC_`.
- `API_INTERNAL_TOKEN` should remain secret and be set in the host's private env values. The frontend can use `NEXT_PUBLIC_API_INTERNAL_TOKEN` only for demo flows.

### Health-check & readiness

- Add a lightweight health-check route (e.g., `/api/health`) that returns 200 and runs a cheap DB ping. Configure your host to use it for readiness checks.

## Step 5: Configure Custom Domain (Optional)

## Step 5: Configure Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., vlookup.your-domain.com)
3. Update DNS records as instructed
4. SSL certificate auto-configured

## Step 6: Set Up n8n Workflows

### Workflow 1: Task Created → Reminders
See full details in `docs/N8N_WORKFLOWS.md` → Workflow 1

**Quick Setup:**
1. n8n → New workflow
2. Add Webhook node → Path: `/webhook/task-created`
3. Add Email node
4. Test with curl
5. Activate workflow

### Workflow 2: Task Completed → Google Sheet
See `docs/N8N_WORKFLOWS.md` → Workflow 2

**Quick Setup:**
1. n8n → New workflow
2. Add Webhook node → Path: `/webhook/task-completed`
3. Add Google Sheets node
4. Test with curl
5. Activate workflow

### Workflow 3: Daily Summary
See `docs/N8N_WORKFLOWS.md` → Workflow 3

**Quick Setup:**
1. n8n → New workflow
2. Add Cron node → `0 19 * * *` (7 PM UTC)
3. Add HTTP Request → GET `https://your-app.vercel.app/api/reports/summary`
4. Add Email node
5. Activate workflow

## Step 7: Verify Production Setup

### Test API
```bash
# From anywhere (production URL):
curl https://your-app.vercel.app/api/clients
curl https://your-app.vercel.app/api/reports/summary

# Test with auth
curl -X POST https://your-app.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -H "x-internal-token: $API_INTERNAL_TOKEN" \
  -d '{"title":"Test","type":"RENT","clientId":"...","dueDate":"2026-06-01"}'
```

### Test Webhooks
```bash
# Test task-created webhook
curl -X POST https://your-n8n.com/webhook/task-created \
  -H "Content-Type: application/json" \
  -d '{
    "taskId":"test-123",
    "title":"Test task",
    "dueDate":"2026-06-01T10:00:00Z",
    "clientName":"Test Client"
  }'

# Check n8n execution logs
```

### Monitor Performance
1. Vercel Dashboard → Analytics
2. Check response times, error rates
3. Monitor database connections

## Step 8: Set Up Monitoring & Alerts

### Vercel Alerts
1. Settings → Monitoring
2. Enable performance alerts
3. Set error rate thresholds

### n8n Alerts
1. Workflow → Settings
2. Enable error notifications
3. Send to Slack/Email on failure

### Database Monitoring
If using Supabase:
1. Go to Dashboard
2. Monitor → Database health
3. Set up connection alerts

## Step 9: Backup & Disaster Recovery

### Database Backups
**Supabase:**
- Automatic daily backups (7-day retention)
- Manual backup: Dashboard → Backups → Create backup

**Self-hosted PostgreSQL:**
```bash
# Daily backup script
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/db-$(date +%Y%m%d).sql.gz
```

### Code Backups
- GitHub automatically backs up all code
- Vercel keeps deployment history

### n8n Workflow Backups
1. n8n → Workflow settings
2. Export workflow as JSON
3. Store in GitHub

## Step 10: Security Hardening

### HTTPS
- ✅ Vercel auto-enables HTTPS
- ✅ n8n cloud includes SSL

### API Keys
```bash
# Generate strong tokens (32-64 chars)
openssl rand -base64 32

# Update environment variables
API_INTERNAL_TOKEN=<new-strong-token>
NEXT_PUBLIC_API_KEY=<new-strong-token>
```

### Database Security
- ✅ Use strong passwords (20+ chars, mixed case, numbers, symbols)
- ✅ Enable SSL connections
- ✅ Restrict network access to Vercel IPs only
- ✅ Regular backups enabled

### Rate Limiting (Advanced)
```typescript
// Add to route handlers for production
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
})

// In API route:
const { success } = await ratelimit.limit(req.ip || '')
if (!success) return new Response('Rate limited', { status: 429 })
```

## Maintenance Schedule

### Daily
- Monitor Vercel analytics
- Check n8n workflow executions
- Review error logs

### Weekly
- Check API response times
- Verify webhook deliveries
- Test manual backup restore

### Monthly
- Update dependencies: `npm update`
- Review security advisories: `npm audit`
- Optimize database indexes
- Check cost trends (Supabase, Vercel)

### Quarterly
- Security audit
- Performance optimization
- Update documentation
- Review user feedback

## Scaling Considerations

### If tasks exceed 10,000/month:
- Add database indexing: `npx prisma db execute --stdin < indexes.sql`
- Enable query caching (Redis)
- Split API routes by functionality

### If n8n workflows delay:
- Increase n8n resources (if self-hosted)
- Switch to n8n Premium for higher throughput
- Optimize workflow logic (reduce steps)

### If frontend becomes slow:
- Enable Vercel's Analytics
- Optimize images
- Add Redis caching for reports

## Support & Troubleshooting

### Check Status
```bash
# API health
curl https://your-app.vercel.app/api/clients -I

# Database connection
npx prisma db execute --stdin <<< "SELECT 1"

# n8n status
curl https://your-n8n.com/api/v1/workflows -H "X-N8N-API-KEY: $KEY"
```

### Common Issues

**Vercel deployment fails:**
- Check build logs: Vercel Dashboard → Deployments
- Verify environment variables are set
- Run `npm run build` locally

**Webhook timeouts:**
- Increase n8n timeout: Settings → Execution → Timeout (seconds)
- Check network connectivity
- Simplify workflow logic

**Slow API responses:**
- Add database indexes
- Optimize queries
- Check Vercel analytics for bottlenecks

### Get Help
- Vercel support: https://vercel.com/support
- n8n community: https://community.n8n.io
- Supabase docs: https://supabase.com/docs

---

## Success! 🎉

Your production app is now live at:
- **Frontend:** https://your-app.vercel.app
- **API:** https://your-app.vercel.app/api/...
- **n8n:** https://your-n8n-instance.com

Next steps:
1. Invite team members
2. Create real client + task records
3. Test workflows end-to-end
4. Gather feedback
5. Iterate and improve
