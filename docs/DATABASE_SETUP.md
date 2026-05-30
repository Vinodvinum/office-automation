# Database Setup Instructions

## PostgreSQL (Local or Cloud)

### Option 1: Supabase (Recommended for MVP)
1. Go to https://supabase.com
2. Create new project
3. Copy connection string → `DATABASE_URL` in `.env.local`
4. Run `npx prisma db push`

### Option 2: Railway.app
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy connection string → `DATABASE_URL`
4. Run `npx prisma db push`

### Option 3: Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb vlookup

# Set connection string
DATABASE_URL="postgresql://localhost/vlookup"
```

## Initialize Schema

```bash
# Apply migrations
npx prisma db push

# (Optional) Seed sample data
npx prisma db seed
```

## Verify Connection

```bash
# Open Prisma Studio
npx prisma studio

# You should see the schema in your browser
```

## Troubleshooting

### Connection refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ Ensure PostgreSQL is running: `brew services start postgresql@15`

### Database already exists
```
Error: database "vlookup" already exists
```
→ Use existing database or drop it: `dropdb vlookup`

### Wrong credentials
```
Error: FATAL: role "user" does not exist
```
→ Update `DATABASE_URL` with correct username/password
