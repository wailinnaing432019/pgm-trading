# PGM Trading

Next.js 16 + Prisma 6 website and admin CMS for Pacific Global Myanmar: product
catalog, dynamic page content, news, offices, inquiries and newsletter
subscriptions.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL` to a PostgreSQL connection string, for example:

   ```env
   DATABASE_URL="postgresql://postgres:root@localhost:5432/pgm-trading"
   ```

3. Generate the Prisma client and apply the schema:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   For an existing/production database use `npx prisma migrate deploy` instead
   of `db:migrate`.

4. Seed the site content and the admin account:

   ```bash
   npm run db:seed
   ```

   The seeded admin login is `admin@pgm-trading.com` / `admin123`. Change this
   password before deploying.

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). The admin dashboard is
   at [http://localhost:3000/admin](http://localhost:3000/admin).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:push` | Push the schema without creating a migration |
| `npm run db:seed` | Seed categories, products, page content and the admin user |

## Deploying on Ubuntu / AWS

The production server must be reachable over HTTPS, or the browser will drop the
`Secure` admin session cookie and the login page will keep reappearing.

Recommended setup: run `npm run build && npm run start` behind nginx with a TLS
certificate, and forward the original protocol/host. For example:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`X-Forwarded-Proto` lets the app mark the session cookie `Secure` only when the
site is actually served over HTTPS.

If you are testing over plain HTTP (e.g. `http://EC2-IP:3000`), add this to
`.env` and restart the server:

```env
AUTH_COOKIE_SECURE="false"
```

Remove it once HTTPS is configured.

## Notes

- Public pages read their content from PostgreSQL. Admin actions call
  `revalidatePath`, so edits appear on the public site immediately.
- Uploaded images are written to `public/media` (ignored by git). Use a
  persistent volume or an object-storage adapter in production.
- Passwords are stored with scrypt. Accounts created with the original
  unsalted SHA-256 seed hash are upgraded automatically on their next sign-in.
- Configure `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` or `RESEND_API_KEY` to
  receive inquiry notifications.
