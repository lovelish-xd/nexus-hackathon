# Nexus Gaming Hackathon

A private hackathon concept built with Next.js 16, React 19, TypeScript, and local SQLite storage. Browse seasonal project galleries, create an account, submit a build, and walk through a winner's prize claim.

Event participation, submission totals, rankings, prizes, and sponsor placements are illustrative. Real project names and brand assets do not establish participation or endorsement. Prize claims do not trigger fulfillment or shipping.

## Getting started

Use Node.js 22.14 or later and npm. SQLite comes from Node's built-in `node:sqlite` module; no separate database service is required.

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The database is created automatically when first accessed.

### Optional winner walkthrough

```sh
npm run seed
```

This creates the preloaded MVPicks owner account and its submitted 2026 winning project. The command prints credentials only when it creates the account; save them for the walkthrough. Running it again preserves the existing password. Set `NEXUS_SEED_EMAIL` before running the command to override the seed script's default email.

Regular sign-ups receive neither MVPicks ownership nor winner status.

## Features and routes

| Route | Purpose |
| --- | --- |
| `/` | Event overview, prizes, and sponsors |
| `/projects` | Searchable gallery with category and season filters |
| `/projects/[slug]` | Curated project details |
| `/winners` | Winning projects |
| `/seasons` | Previous-season overview |
| `/sign-in`, `/sign-up` | Account access and registration |
| `/dashboard` | Signed-in participant's projects and rewards |
| `/profile` | Account profile editing |
| `/submit` | Create a draft or submit a project |
| `/submissions/[id]` | Owner-only submission details and editing |
| `/claims` | Eligible winner's private delivery details |

The galleries support 2026 and 2025, with 20 selected projects and three winners per season. The displayed submission totals are 184 and 156 respectively. Both seasons reuse the curated catalog with different podiums; these are concept fixtures.

Participant submissions appear in the owner's dashboard and are not automatically added to the curated Top 20. Submitting requires a description and a live project, walkthrough, or repository link. Drafts can be saved before those submission requirements are complete.

The proposed prize lineup is a PlayStation 5, an AOC CU34G4Z 34-inch gaming monitor, and a Logitech G213 keyboard. The claim flow stores delivery details for eligible 2026 winning submissions.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server using webpack on `127.0.0.1` |
| `npm run build` | Create a production build using webpack |
| `npm start` | Serve the production build on `127.0.0.1` |
| `npm test` | Run the Node.js test suite |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run seed` | Create the walkthrough owner account and winning submission |

For a local production preview, run `npm run build` followed by `npm start`.

Tests cover gallery filtering, season and winner fixtures, URL validation, account credentials, password hashing, sessions, expiry, throttling, submission ownership and validation, and prize claims.

## Configuration and storage

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXUS_DB_PATH` | `.data/nexus.sqlite` | SQLite file path; relative paths resolve from the working directory |
| `NEXUS_HTTPS` | Unset | Set to `true` to mark session cookies Secure when serving over HTTPS |
| `NEXUS_SEED_EMAIL` | Default email in `scripts/seed-account.ts` | Email used by the optional seed command |

Set variables in the shell before running a command. The seed script runs directly in Node and does not load Next.js environment files.

Accounts, sessions, throttling records, submissions, and prize claims persist in SQLite. The `.data/` directory is ignored by Git and excluded from Next.js output tracing. Keep database files outside public assets and preserve them when replacing a build. For a simple backup, stop the app and copy the database directory, including any SQLite journal files. Earlier browser-local profiles are not automatically imported.

Passwords use salted scrypt hashes. Sessions use random opaque tokens, store token hashes in SQLite, expire after seven days, and use HttpOnly, SameSite=Lax cookies. Mutations run through Next.js Server Actions with authentication and ownership checks; account attempts are throttled in the local database.

This setup targets a single server with persistent writable storage. Public deployment still needs email verification, password recovery, shared rate limiting where multiple instances are used, and deployment-specific HTTPS configuration. Use fictional recipient details for the private walkthrough: claim addresses and phone numbers are stored in the local database.

## Project layout

```text
app/                     Pages, layouts, styles, and Server Actions
components/              Shared UI and participant forms
lib/                     Accounts, persistence, submissions, and curated event data
scripts/seed-account.ts  Optional walkthrough account setup
tests/                   Node.js tests
public/images/           Cached assets and image source manifest
archive/html-prototype/  Original HTML prototype
```

Project descriptions are based on the linked project sites and repositories. Image source URLs are recorded in [public/images/sources.json](public/images/sources.json). Visuals combine cached project and product assets with original concept artwork; illustrations are not project screenshots or official product photography. MVPicks uses an owner-approved asset, and sponsor placements are imagined partnerships.
