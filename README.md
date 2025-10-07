# YAC Reality TV Fantasy – Monorepo

Multi-league fantasy app for *Survivor*, *Big Brother*, etc.
Frontend: React/Vite/Tailwind. Backend: Node/Express. Auth: Firebase. DB: MongoDB (or Supabase Postgres with light porting).

* Full product spec: `docs/PRD.md`
* This file: setup, env, run, seed, deploy notes.

---

## Repo Layout

```
yac-v1/
 ├─ docs/
 │   └─ PRD.md
 ├─ server/              # Node/Express API (Mongo/Mongoose)
 │   ├─ src/
 │   │   ├─ models/
 │   │   ├─ routes/
 │   │   ├─ middleware/
 │   │   ├─ lib/
 │   │   └─ index.js
 │   ├─ package.json
 │   └─ .env.example
 ├─ web/                 # React/Vite frontend
 │   ├─ src/
 │   ├─ package.json
 │   └─ .env.example
 └─ README.md            # this file
```

---

## Prereqs

* Node 20+
* npm 9+
* MongoDB (local or container)
* A Firebase project (for Auth)
* (Optional) Docker/Coolify on a VPS

---

## Environment Variables

### `server/.env`

```bash
# Server
PORT=4000
MONGO_URI=mongodb://localhost:27017/yac-v1

# Firebase Admin (Service Account)
FIREBASE_PROJECT_ID=yac-fantasy-league
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@yac-fantasy-league.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUtkqE1xy0ByO6\nGv5VyCG2Qtw/nos+oszLC+3Pvm4llPNkUQUvih33OzkqqvhXYD5lvuSMN9TpBm+l\nRCnAg9EOt5QpYdRhylXSGdvGHs3dpROch1XPXaXgcGLZwSTwLGRlBKhuhyQWADFJ\nQNnkW5lN1aDW/FbKTgZ/ZUqAptTJp8MAP2XtW7GGOmnmt3mtrcLlvtsCac5dIHmj\nkDapTz6Jt6QgMyGZUHrDmQ9BOMIHzi0CpPT47nhQUiYA8ekLEHTLcr/zNEJnxV1P\n2YKRH4Pt95kY1W252NqyvLbgre288uGamzMgYdgxqTaYDMAzgASzdUBL2OqcDm9R\nsJy8sMAlAgMBAAECggEARSyqazJ4ypFLoCUwS4zFibd+JiXElcU6x/Rrkaf+KoMn\n2HELnXp8x+UHiX5v+IzvWXq7azIJWr/ArTqQxVlLpLHmPH2iQj7RPuMCZR0tG73O\n6o/VbZkdMNJ2WN5MJWAw7wCErK02Lvm182I0ONIW9Kq7n2VPpdk3koj2Z/OypX4r\nH93h4onG23V+IN9ZQOXk8wsqf8n4I/61fVdbtCu3E5m2B4ITVZRAhicNeUfg8r0b\nP2P7lSCSFwUMjG9uDTLt5H6J4VJRZF8YXxF2A6tcgAuPdQ4VnuP5AfrRMU9RPitL\nNWaJmGlasafy0+UtQY+qFrWUmogoI7YPtNDcCfct3QKBgQDN/xZt5yddQfqFbdcI\nrX8x6nLWT+DpLKbL3fKXJyUwIBaI+F0okQ1fAjcVqyQSboCL2uQV7ej8yySXRIFU\n4uu4vzFw9WQpWw93AOqU9JgvMTutBPXhtD0Gk7Zv+NQAGIkf0AGINdDL4b7I+q6M\nYTP9JHplEbW6jELlQVxozb7YtwKBgQC4z3i22wS+xWJvZgdQDhH7dp9rIaF1cXLW\nz3nKTnLRtlnwk/y+5hZmHM1f6GqB1/t1me7qVjy4TAGQ+WO3zJoKG6+sufEpV/Le\nQPHB6Mz2VjL+25rdrhwCj2b9iPZ72d4YAwi5vy9mdcQ/rmo+R1WqG3DDmGtEUVhH\ndIyYAjt6AwKBgQC23zHGN2MWwy/nq+8t4Pf+FCgGYbtExUL90Pc/gJze8F2REwuA\nq+S253yHW/sV8ctkXNoHLcGcSaseLs6x0RF6XSFDKlXU8OX1u3aE7e78VjSoELNH\nv349jHx1QuzRePaiq0Hw7fWCSdHZEdJLBS/mFrAhcWtnRIVOiIvE7oHyWQKBgG9R\n6XCbdLxEwQpA9t6t2v8RcO1jEJJhh78EsmO95UOVB4/2VCPZDFzttHe005LqujkY\nQ+U7lM+eWMMutXYc9BxqmOL+DdnNdCmUDQu0YuFvAsCpHxuwqIaSQoMtYOsxTKpC\nCZt5IeAhx9hkAvMInP0eEkp/IP3B0d8YwSc/EPxpAoGAF3wvc5jul0mtfSlOuWW3\nQcF0hvRgO876VD6AJ0YP/ECazJKWc/k7nziwQi9qQClcGlwxoU+gvs6BXqziMnda\ngJQa0AsUT1jn/lkyPHZRZ4wLQ7nckFSbrYCRsQt94vHNup/iSa17g6eLwNI3eyvZ\ndEaWIbAeegCLpGuVoG8dyC8=\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGIN=https://app.yadkinaquatic.club

# App Admins (comma-separated emails)
ADMIN_EMAILS=scottmcquaig@gmail.com,towelboy@yadkinaquatic.club
```

> Tip: If using Docker/Coolify, set these as app env vars (don’t commit secrets).

### `web/.env`

```bash
# API base URL
VITE_API_URL=http://localhost:4000/api

# Firebase Client SDK
VITE_FIREBASE_API_KEY=AIzaSyCNNCVA79p4gMT-AZ2s3KpV4_Cb4IImE3A
VITE_FIREBASE_AUTH_DOMAIN=yac-fantasy-league.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yac-fantasy-league
```

---

## Install & Run (Local Dev)

### 1) API

```bash
cd server
npm install
npm run dev     # starts on http://localhost:4000
```

You should see:

```
✅ Mongo connected
✅ API on :4000
```

Health check:

```bash
curl http://localhost:4000/api/health
```

### 2) Web

```bash
cd web
npm install
npm run dev     # starts on http://localhost:5173
```

---

## Seed Data

There are two seed scripts depending on whether you want a quick single-league demo or a league-aware setup.

### Quick demo seed

```bash
cd server
npm run seed
```

### Dynamic league seed (recommended)

1. Edit `server/src/scripts/seed_dynamic.js` to set your **owner UID** (Firebase user id).
2. Run:

```bash
cd server
node src/scripts/seed_dynamic.js
```

This will print the created `LeagueId`. Save it.

---

## Creating Your First Admin User

Admins are matched by email via `ADMIN_EMAILS`.
Ensure your Firebase Auth user’s email is listed in `ADMIN_EMAILS`. No DB write needed.

---

## Minimal Dev Workflow

1. **Login** in the web app (Firebase Auth).
2. **Create League** (POST `/api/leagues`) via UI or cURL:

   ```bash
   curl -X POST http://localhost:4000/api/leagues \
     -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "leagueName":"YAC Survivor Fantasy 2025",
       "settings": { "show":"Survivor","seasonLabel":"S49","maxTeams":8,"membersPerTeam":2 }
     }'
   ```
3. **Import Players** (Admin):

   ```bash
   curl -X POST http://localhost:4000/api/leagues/<LEAGUE_ID>/players/import \
     -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
     -d '{
       "players":[{"name":"Charlie"},{"name":"Hunter"},{"name":"Venus"}]
     }'
   ```
4. **Generate Invite** (Admin):

   ```bash
   curl -X POST http://localhost:4000/api/leagues/<LEAGUE_ID>/invites \
     -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
     -d '{ "type":"league","multiUse":true,"maxUses":10 }'
   ```

   Share the `code` with friends.
5. **Redeem Invite** (Player):

   ```bash
   curl -X POST http://localhost:4000/api/invites/redeem \
     -H "Authorization: Bearer <PLAYER_TOKEN>" -H "Content-Type: application/json" \
     -d '{ "code":"<INVITE_CODE>", "teamName":"Hank & Lee" }'
   ```
6. **Start Draft** (Admin):
   `POST /api/leagues/<LEAGUE_ID>/draft/start`
7. **Make Picks** (Team member):
   `POST /api/leagues/<LEAGUE_ID>/draft/pick { teamId, playerId }`
8. **Add Scoring** (Admin):
   `POST /api/leagues/<LEAGUE_ID>/scoring/add { week, playerId, type, description }`
9. **Leaderboard**:
   `GET /api/leagues/<LEAGUE_ID>/teams/leaderboard`

---

## Frontend Notes

* The app stores `idToken` (Firebase) in `localStorage` and sends it via `Authorization: Bearer <token>` on API calls.
* Add a **League Switcher** that:

  * Loads `/api/leagues/mine`
  * Saves `leagueId` to `localStorage`
  * All league routes should use `/api/leagues/${leagueId}/...`

---

## Adapting to Other Shows (Big Brother)

Create a league with tailored scoring:

```bash
POST /api/leagues
{
  "leagueName":"Big Brother 27 Fantasy",
  "settings":{
    "show":"Big Brother",
    "seasonLabel":"BB27",
    "maxTeams":10,
    "membersPerTeam":2,
    "scoringRules":{
      "HOH_WIN":5,
      "VETO_WIN":4,
      "NOMINATED":-2,
      "SAVED_FROM_NOMINATION":3,
      "EVICTED":-3,
      "WINS_SEASON":10
    }
  }
}
```

Then import houseguests via `/players/import` and proceed with draft/scoring.

---

## Docker & Deploy Notes (High-Level)

> Detailed VPS/Coolify steps can live in a separate ops doc if you prefer. This is the minimal info your platform engineer needs.

* **Server Dockerfile** (example):

  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci --omit=dev
  COPY src ./src
  EXPOSE 4000
  CMD ["node","src/index.js"]
  ```

* **Web** is a static Vite build (`web/dist`).
  In any platform (Coolify/NGINX/Netlify), serve `dist` and set:

  ```
  VITE_API_URL=https://your-api-domain/api
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  ```

* Ensure the API service has `ALLOWED_ORIGIN` including your frontend domain(s) for CORS.

---

## Claude CLI – Suggested Bootstrap Prompt

Use this to wire up anything missing, generate components, and validate endpoints:

```
Act as a senior full-stack engineer. Use docs/PRD.md for product scope.
Repo structure is /server (Express/Mongoose) and /web (React/Vite/Tailwind).

Tasks:
1) Ensure all league-scoped routes exist and compile; add unit-safe input validation.
2) Implement League Switcher page; persist leagueId to localStorage; update API client to prefix /leagues/:leagueId.
3) Complete Admin Panel tabs: Settings, Invites (code generator), Players Import (bulk textarea), Draft (start/reset), Scoring (add event), Weeks (finalize).
4) Add a read-only Draft Board component (grid of teams × rounds) that updates when picks occur.
5) Add minimal toasts/alerts on success/error for admin actions.
6) Verify CORS respects ALLOWED_ORIGIN.
7) Add README snippets to show cURL examples matching routes.
8) Confirm seed scripts run without error on a clean DB.
Deliver a working app locally with npm scripts and a production build for the web.
```

---

## Troubleshooting

* **401 Unauthorized**: Ensure the frontend is sending Firebase ID token; check browser devtools → Network → request headers.
* **403 Forbidden**: Your Firebase email may not be in `ADMIN_EMAILS`, or you’re not a member of the target team/league.
* **CORS**: Add your web origin(s) to `ALLOWED_ORIGIN` (comma-separated). Restart server.
* **Mongo connection**: Verify `MONGO_URI` and DB is reachable from the API container/host.

---

## License

Private/internal project (custom). Add a license file if distributing.
