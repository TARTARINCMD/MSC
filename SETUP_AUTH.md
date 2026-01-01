# Authentication Setup Guide

## Step 1: Set up Database

You have two options:

### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a database:
   ```bash
   createdb spotify_finds
   ```
3. Update `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/spotify_finds"
   ```

### Option B: Free Cloud Database (Recommended)
1. Go to [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Create a free account and new project
3. Copy the connection string
4. Update `.env`:
   ```
   DATABASE_URL="your_connection_string_here"
   ```

## Step 2: Set up NextAuth Secret

Add to your `.env` file:
```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secret:
```bash
openssl rand -base64 32
```

## Step 3: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables
- Generate Prisma Client

## Step 4: Generate Prisma Client

```bash
npx prisma generate
```

## Step 5: Start the App

```bash
npm run dev
```

## What's Been Set Up

✅ NextAuth.js authentication
✅ Prisma database schema (User + SpotifyFind models)
✅ Login/Signup pages
✅ API routes for authentication
✅ API routes for managing finds
✅ Protected routes (users can only see their own finds)
✅ Add Find page for posting new music

## Next Steps

1. Set up your database (see Step 1)
2. Add DATABASE_URL and NEXTAUTH_SECRET to `.env`
3. Run migrations
4. Test by creating an account and adding finds!

