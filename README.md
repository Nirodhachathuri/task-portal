# Task Portal

A small full-stack task management portal built with Next.js, Prisma 7, SQLite, and secure cookie-based authentication.

## Stack

- Next.js App Router
- React + TypeScript
- Next.js Route Handlers for the backend API
- Prisma ORM 7
- SQLite for local development
- `@prisma/adapter-better-sqlite3` for Prisma 7 SQLite connectivity
- bcryptjs for password hashing
- jose for signed HTTP-only sessions
- Zod for request validation

## Setup

Requirements: Node.js 20+ and npm.

```bash
cp .env.example .env
```

Set a real secret in `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-long-random-secret"
```

Install dependencies:

```bash
npm install
```

Generate Prisma Client and create/update the SQLite database:

```bash
npm run db:generate
npm run db:push
```

Start the application:

```bash
npm run dev
```

Open http://localhost:3000/register to create the first user.

