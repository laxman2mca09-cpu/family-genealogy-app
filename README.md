# Family Genealogy App

A dynamic Next.js genealogy application backed by PostgreSQL through Prisma.

## Neon PostgreSQL setup

1. Create a PostgreSQL database in Neon.
2. Copy the Neon connection string.
3. Set `DATABASE_URL` locally in `.env.local` and in Vercel Project Settings → Environment Variables.
4. For a new database, apply the checked-in schema with:

```bash
npm install
npx prisma migrate deploy
```

For local development without migrations, `npx prisma db push` is also supported.

5. Start the application:

```bash
npm run dev
```

Optional demo data:

```bash
npm run db:seed
```

## Dynamic genealogy features

- People are stored in PostgreSQL, not browser localStorage.
- Add, edit and delete family members.
- Connect parents, children and spouses.
- Browse the live family tree and people directory.
- Open a persisted profile for each family member.
- Prisma handles the PostgreSQL data model and cascading relationship deletes.

## Vercel

Set `DATABASE_URL` for Production (and Preview if desired), then redeploy. The build runs `prisma generate` automatically. Run `npm run db:migrate` once against the Neon database before the application first uses it, or use `prisma db push` for an empty development database.
