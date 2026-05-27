# AI Design Workspace

Issue #23 hardens the API/E2E and deployment readiness layer on top of the
existing authenticated P0 project generation, auth, persistence, schema,
controlled Sandpack preview, version rollback, and server ZIP export
foundations.

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
- Server-side static and editable-project ZIP export for validated current
  version snapshots, including export records, quota records, and prototype
  boundary README content.
- The current export entry is a direct server download link. The full PRD export
  dialog, pre-export checklist, in-progress state, success state, and retry flow
  remain future UI work after the first API/E2E hardening pass.
- Phase 1 through Phase 9 verification scripts.
- Playwright protected-route smoke coverage for public pages, authenticated
  redirects, and export-route failure redirects.

Cross-user API/E2E coverage, full export dialog UX, real deployment verification,
and real payment or subscription logic are intentionally not implemented yet.

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
npm run test:e2e
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

## Deployment

Vercel is the intended MVP deployment target. Configure these variables in the
Vercel project settings before testing a preview or production deployment:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_DATABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Do not commit real values. Supabase migrations and RLS policies must be applied
to the target project before release. The OpenAI key is required only on the
server side for real generation calls; automated tests use deterministic mocks
where possible.

## Project Boundaries

Issue #23 keeps export packaging behind server-side owner checks and validated
snapshot boundaries, while adding portable Playwright smoke coverage and
deployment notes. Future work should keep business logic out of `src/app`
route files where possible and use:

- `src/features` for frontend product areas.
- `src/lib/fixtures` for mock data that must not become the production data
  source.
- `src/server/auth` for Supabase session handling and server actions.
- `src/server/db` for Drizzle schema and database client setup.
- `src/server/projects` for project ownership and persistence logic.
- `src/server/quota` for operation-count quota records.
- `src/server/versions` for version history, snapshot validation, and rollback
  orchestration.
- `src/server/export` for manifest preparation, ZIP archive creation, export
  records, and export quota usage.
- `src/schemas` for runtime validation.
- `src/prompts` for auditable prompt templates.
- `src/types` for shared TypeScript types.

`localStorage` must remain limited to drafts and UI preferences. Project primary
data, quota records, versions, conversations, export records, and ownership data
belong in the database.
