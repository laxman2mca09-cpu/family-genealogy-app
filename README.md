# Family Genealogy App

A dynamic Next.js genealogy application backed by PostgreSQL through Prisma.

## Database setup

1. Create a PostgreSQL database (Neon is a convenient managed option).
2. Copy the database connection string.
3. Set `DATABASE_URL` locally in `.env.local` and in Vercel Project Settings → Environment Variables.
4. Run:

```bash
npm install
npx prisma db push
npm run dev
```

Optional demo data:

```bash
npm run db:seed
```

## Vercel

Set `DATABASE_URL` for Production (and Preview if desired), then redeploy. The build command runs `prisma generate` automatically.

The application stores people and relationships in PostgreSQL. Browser localStorage is no longer used for family data.
