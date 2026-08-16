# Prisma setup

This project uses Prisma 7 with SQLite and the `@prisma/adapter-better-sqlite3` driver adapter.

Run from the project root:

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run dev
```
