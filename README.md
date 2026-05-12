# AI Design Workspace

Phase 3 adds the first persistence and authentication foundation on top of the
Phase 1 scaffold and Phase 2 fixture-driven workspace shell.

## Current Stage

This is not the full MVP. The app now establishes:

- Next.js App Router with TypeScript.
- Tailwind CSS global styling.
- Source directories for app, components, features, lib, server, schemas,
  prompts, and shared types.
- Supabase Auth server boundary for lightweight account login and logout.
- Protected `/projects` and `/workspace` routes that require a current user.
- Drizzle ORM schema for projects, pages, versions, conversations, generation
  requests, generation results, export records, quotas, and user profiles.
- Server-side project repository/service functions that bind project reads and
  writes to the authenticated owner.
- Zod schemas for project and quota inputs.
- Phase 1, Phase 2, and Phase 3 verification scripts.

The workspace preview still uses fixture content. Real AI generation, Sandpack
runtime preview, export packaging, version rollback UI, and real payment or
subscription logic are intentionally not implemented yet.

## Setup

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Run the available checks:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Environment

Create a local `.env` file from `.env.example` when services are connected.
Do not commit `.env` or real keys.

Phase 3 variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Reserved for the later AI phase:

- `OPENAI_API_KEY`

OpenAI API keys, Supabase service role keys, and database URLs must stay
server-only. Browser code may only use the public Supabase URL and anon key.

## Project Boundaries

Phase 3 establishes the auth and persistence boundary, but it does not turn the
fixture workspace into a real generator yet. Future work should keep business
logic out of `src/app` route files where possible and use:

- `src/features` for frontend product areas.
- `src/lib/fixtures` for mock data that must not become the production data
  source.
- `src/server/auth` for Supabase session handling and server actions.
- `src/server/db` for Drizzle schema and database client setup.
- `src/server/projects` for project ownership and persistence logic.
- `src/server/quota` for operation-count quota records.
- `src/schemas` for runtime validation.
- `src/prompts` for auditable prompt templates.
- `src/types` for shared TypeScript types.

`localStorage` must remain limited to drafts and UI preferences. Project primary
data, quota records, versions, conversations, export records, and ownership data
belong in the database.
