# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Next.js App Router pages (`app/page.tsx`, `app/login/page.tsx`) and API routes (`app/api/**/route.ts`).
- `components/`: feature components; `components/ui/` contains shadcn/ui primitives.
- `lib/`: shared helpers (DB, auth/session, encryption, API client helpers).
- `public/`: static assets served as-is.
- `middleware.ts`: auth redirect guard for public vs. protected routes.

## Build, Test, and Development Commands

- `npm install`: install dependencies (this repo includes `package-lock.json`).
- `npm run dev`: start the dev server (defaults to `http://localhost:3000`).
- `npm run build`: production build (also performs TypeScript checks).
- `npm start`: run the built app.
- `npm run lint`: run ESLint using `eslint.config.mjs` (fix before opening a PR).
  - Optional: `npx eslint . --fix` for auto-fixable issues.

## Configuration & Security Tips

- Required env vars:
  - `DATABASE_URL`: Postgres connection string (used by `lib/db.ts`).
  - `ENCRYPTION_KEY`: 64 hex chars (AES-256 key; enforced in `lib/crypto.ts`). Generate with `openssl rand -hex 32`.
- Do not commit secrets. Prefer `.env.local` for local dev and share a redacted `.env.example` when adding new variables.
- Expected DB tables include `users` (with `email`, `password_hash`) and `accounts` (with `user_id`, `encrypted_password`, `encrypted_otp_secret`).

## Coding Style & Naming Conventions

- TypeScript is `strict` (`tsconfig.json`). Keep server-only code in route handlers/middleware and shared utilities in `lib/`.
- Match nearby file formatting; avoid drive-by reformatting (shadcn/ui files follow a different style than some feature code).
- Naming patterns:
  - Routes: `app/<route>/page.tsx`
  - API handlers: `app/api/<name>/route.ts` (and nested segments like `app/api/accounts/[id]/route.ts`)
  - Components: kebab-case filenames with PascalCase exports (e.g., `components/add-account-dialog.tsx` → `AddAccountDialog`).

## Testing Guidelines

- No dedicated test suite is set up yet. For changes, run `npm run lint` and `npm run build`, then manually verify the login flow and `/api/accounts` CRUD.

## Commit & Pull Request Guidelines

- Git history is currently minimal; use short, imperative commit messages (e.g., `Fix OTP parsing`, `Add logout button`).
- PRs should include: a concise summary, steps to test, screenshots for UI changes, and a note for any env/schema changes.

