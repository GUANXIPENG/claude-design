# AI Design Workspace

Issue #21 connects version history and project-level rollback UI on top of the
existing authenticated P0 project generation, auth, persistence, schema, and
controlled Sandpack preview foundations.

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
- Server-only OpenAI Responses provider boundary with structured output and
  Zod/path allowlist validation.
- Authenticated project generation form that creates projects, pages, initial
  versions, generation records, conversation messages, and quota usage records.
- Workspace loading from `/workspace?projectId=<id>` using the persisted current
  version snapshot.
- Pre-Sandpack safety gates for service-only business writes, server-side prompt
  validation, canonical generated file paths, and generated file size/count
  limits.
- Controlled Sandpack preview for validated current-version snapshots.
- Version history UI with historical preview, second confirmation, and
  project-level rollback that creates a new current version record.
- Phase 1 through Phase 7 verification scripts.

Export packaging, API/E2E hardening, and real payment or subscription logic are
intentionally not implemented yet.

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

AI generation variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` defaults to `gpt-5.5` when unset.

OpenAI API keys, Supabase service role keys, and database URLs must stay
server-only. Browser code may only use the public Supabase URL and anon key.

## Project Boundaries

Issue #21 keeps version history and rollback behind server-side owner checks and
validated snapshot boundaries. Future work should keep business logic out of
`src/app` route files where possible and use:

- `src/features` for frontend product areas.
- `src/lib/fixtures` for mock data that must not become the production data
  source.
- `src/server/auth` for Supabase session handling and server actions.
- `src/server/db` for Drizzle schema and database client setup.
- `src/server/projects` for project ownership and persistence logic.
- `src/server/quota` for operation-count quota records.
- `src/server/versions` for version history, snapshot validation, and rollback
  orchestration.
- `src/schemas` for runtime validation.
- `src/prompts` for auditable prompt templates.
- `src/types` for shared TypeScript types.

`localStorage` must remain limited to drafts and UI preferences. Project primary
data, quota records, versions, conversations, export records, and ownership data
belong in the database.
