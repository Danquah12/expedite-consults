# Noctis

The social network for human growth — Clinic, Reels, Study, Hub, Music, and Desk.

Built for [Expedite Consults LLC](https://www.expediteconsults.com/).

## Run

```bash
npm install
npm run dev
```

Sign in as a member. Desk (operator console) is at `/desk`.

## GitHub

Source: [github.com/Danquah12/VibeTok](https://github.com/Danquah12/VibeTok)

Pushes to `main` run typecheck + production build (GitHub Actions).

## Vercel

The GitHub repo is ready. Link it once Vercel is connected to team **kwesi-asiedus-projects**:

1. In Grok, reconnect **Vercel** and approve team `kwesi-asiedus-projects`.
2. Or in [vercel.com](https://vercel.com): Add New → Project → Import `Danquah12/VibeTok`.
3. Framework: Vite / TanStack Start. Build: `npm run build`. Node 22.
4. Set environment variables from `.env.example` (see below), then deploy.

### Environment variables

| Name | Required | What it does |
|---|---|---|
| `DATABASE_URL` | Yes on Vercel | Neon Postgres. Desk, staff MFA, and accounts live here. Without it the app falls back to an in-memory DB that vanishes on each deploy. |
| `BETTER_AUTH_URL` | Yes | The live site URL, e.g. `https://your-project.vercel.app` |
| `BETTER_AUTH_SECRET` | Yes | Random 32+ character string for cookies |
| `VITE_AUTH_ENABLED` | Yes | Set `true` so visitors must sign in |
| `XAI_API_KEY` | Optional | Lesson-song and interview (server only) |

Create a Neon database, copy its connection string into `DATABASE_URL`, then add the four required rows in Vercel → Settings → Environment Variables for **Production** and **Preview**.
