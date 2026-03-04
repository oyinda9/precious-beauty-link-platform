# Supabase setup and Netlify deployment guide

This document explains how to provision a Supabase Postgres database, run Prisma migrations, and configure Netlify environment variables so the deployed site can reach the DB.

1. Create a Supabase project

- Sign up / sign in at https://supabase.com
- Click "New project" → choose a name and a password for the DB (store password safe)
- Wait for the project to be created

2. Get the Postgres connection string (DATABASE_URL)

- In Supabase, open Project → Settings → Database
- Copy the "Connection string" (the standard Postgres URL)
  Example format:
  postgres://USER:PASSWORD@HOST:PORT/DATABASE

3. Add environment variables to Netlify

- Open Netlify dashboard → your site → Site settings → Build & deploy → Environment
- Add these variables (set scope to "All contexts"):
  - `DATABASE_URL` = paste the connection string from Supabase
  - `JWT_SECRET` = a random long string (32+ chars)
- Save changes and trigger a deploy (Deploys → Trigger deploy)

4. Run Prisma migrations on the Supabase DB

- Locally (recommended): set your shell `DATABASE_URL` temporarily and run migrations
  ```bash
  export DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
  pnpm exec prisma migrate deploy --schema=prisma/schema.prisma
  ```
- Or run `pnpm exec prisma db push --schema=prisma/schema.prisma` to push schema without migrations (not recommended for production if you rely on migration history)

5. Re-deploy and test

- Netlify will run `pnpm install` and `pnpm run build` (which runs `prisma generate` and `next build`)
- After a successful deploy, call `POST https://<your-site>/api/auth/register` and verify it returns 201 or a meaningful error in logs

Troubleshooting

- If Netlify build fails with "Cannot find module '.prisma/client/default'", verify `prisma generate` ran successfully in build logs and that `@prisma/client` and `prisma` versions match.
- If runtime returns 500 and logs show connection refused / timeout: confirm `DATABASE_URL` is correct and your DB allows external connections.
- Supabase uses TLS: make sure the connection string includes required SSL options if your client enforces them.

Security notes

- Keep `DATABASE_URL` and `JWT_SECRET` private. Do not commit them to source.
- For production, create a DB user with limited privileges (not the superuser) if possible.

If you'd like, paste the Supabase `Connection string` (redact user/password) or confirm when you set the env vars and I will guide you through running the migrations and testing the endpoint.
