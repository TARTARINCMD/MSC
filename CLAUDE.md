# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Dev server:** `npm run dev` → http://localhost:3000

**Build:** `npm run build` → `npm start`

**Database:** Prisma + PostgreSQL (Supabase or local)
- Migrations: `npx prisma migrate dev`
- Schema: `./prisma/schema.prisma`
- Generate: `npx prisma generate` (auto-run on `npm install`)

**Lint:** `eslint . --fix`

## Architecture

Music discovery social platform. Users post music finds (Spotify tracks/albums/playlists), interact (like/comment), follow people, earn XP/levels, see news feed, browse genres.

### Core Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Auth:** Supabase Auth (SSR via `@supabase/ssr`)
- **Database:** PostgreSQL via Supabase or local
- **UI/Animation:** shadcn/ui, Three.js, GSAP, Lenis (smooth scroll)

### Database Schema (Key Models)

**User** — accounts + relationships
- `id` (Supabase Auth UID), `email`, `username`, `name`
- Relations: `finds` (SpotifyFind[]), `following`/`followers` (Follow[]), `likes` (Like[]), `xp` (UserXP)

**SpotifyFind** — music posts
- `id`, `title`, `artist`, `type` (track|album|playlist|podcast), `spotifyUrl`, `imageUrl`, `genre`, `description`, `userId`
- Relations: `comments` (Comment[]), `likes` (Like[]), `user` (User)

**Social models:** `Comment`, `Like`, `Follow`, `SavedArticle`

**Gamification:** `UserXP` (totalXp, currentStreak, longestStreak), `XpEvent` (tracks POST_FIND, LIKE_RECEIVED, FOLLOWER_GAINED, STREAK_BONUS, MILESTONE)

**News:** `NewsArticle` (fetched/cached music news by genre/keyword)

### File Structure

**`/app`** — Next.js routes + pages
- `page.tsx` — home (feed + filters)
- `add/` — add music modal + form
- `login/`, `signup/`, `reset-password/` — auth
- `people/[username]/` — user profiles + finds
- `news/` — news feed
- `/api` — route handlers (finds, users, news, auth, XP, metadata scraping)

**`/components`** — React components
- `FindCard*` — display music finds (grid/masonry/horizontal variants)
- `MusicDetailModal` — expanded view + comments/likes
- `AddMusicModal` — post new find
- `MiniPlayer` — embedded player (bottom-right)
- `Navbar`, `Sidebar` — navigation
- `Masonry.tsx` — layout engine (CSS Grid masonry)
- `SupabaseAuthProvider` — auth context

**`/lib`**
- `auth-server.ts` — `getAuthUser()` (server-side Supabase Auth)
- `supabase/` — Supabase client init + env config (SSR pattern via `@supabase/ssr`)
- `data.ts` — TypeScript types (`SpotifyFind`, `FindType`)
- `xp.ts` — XP constants (POST_FIND=100, LIKE_RECEIVED=10, etc.)
- `xp-server.ts` — XP award logic (`handlePostFindXp`, streak updates)
- `api-fetch.ts` — `apiFetch()` helper (same-origin, includes cookies for Supabase SSR)
- `cache.ts` — `fetchSWR`, `invalidateCache` (client-side SWR pattern)
- `genres.ts` — genre list + normalization
- `prisma.ts` — Prisma client singleton

**`/prisma`**
- `schema.prisma` — data model
- `migrations/` — Prisma migration history

### Auth & Database

**Supabase Auth:**
- User signs up → Supabase creates auth user
- Server reads session from cookies via `@supabase/ssr`
- Routes use `getAuthUser()` to fetch auth context on server

**Database pooling:**
- Dev: use `DATABASE_URL` (pooler, pgbouncer)
- Migrations: use `DIRECT_URL` (direct connection, no pooler)
- Fallback: if `DIRECT_URL` unset, `prisma.config.ts` uses `DATABASE_URL` (local dev only)

**Environment:**
```
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
```

See `.env.example` for full config.

### Key Patterns

**API fetch with session:**
```ts
import { apiFetch } from "@/lib/api-fetch";
const res = await apiFetch("/api/finds", { method: "POST", body: JSON.stringify({...}) });
```
Forces cookies to be sent (required for Supabase SSR session).

**Server-side auth check:**
```ts
import { getAuthUser } from "@/lib/auth-server";
const user = await getAuthUser(); // null if not authenticated
if (!user) throw new Error("Unauthorized");
```

**Prisma queries:**
```ts
import { prisma } from "@/lib/prisma";
const finds = await prisma.spotifyFind.findMany({ where: { userId }, include: { user: true } });
```

**XP award on action:**
```ts
import { handlePostFindXp } from "@/lib/xp-server";
await handlePostFindXp(userId, prisma); // auto-awards + checks milestones
```

## Image Remotes

Configured in `next.config.ts`: Spotify CDNs (i.scdn.co, mosaic, seed-mix-image), YouTube (img.youtube.com, i.ytimg.com), Apple Music (is*.mzstatic.com).

## Open TODOs

- Email verification (Supabase?)
- Spotify API (login redirect + parse track/artist from link)
- Following list UI + backend

## Skills

Always use these skills for this project:

- **caveman** — terse, compressed communication. Drop articles/filler/pleasantries, keep technical substance.
- **grill-me** — stress-test plans + design decisions before implementation.
- **ui-ux-pro-max** — UI/UX code review, design guidance, component patterns.

Use on every major task unless explicitly paused.

## Notes

- Last optimized commit: `7f0c7e5`
- Recent: people fix, user page + Easter egg, genres, miniplayer fixes
- ESLint configured; run `npm run lint --fix` before committing
- Type-safe ORM (Prisma) → check migrations before schema changes
