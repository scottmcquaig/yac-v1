# 🧾 YAC Reality TV Fantasy League — Full PRD

## Overview

A **multi-league fantasy game** for reality competition shows (e.g., *Survivor*, *Big Brother*).
Users join private leagues, draft contestants or houseguests, and earn points weekly for in-game events.
Supports **Firebase Auth**, **MongoDB or Supabase local DB**, and deployment via **Coolify on VPS**.

---

## 🎯 Goals

* Private, invite-only fantasy leagues (no public signup).
* Dynamic configuration per show/season.
* Snake draft system for contestants.
* Weekly scoring based on configurable event rules.
* League dashboards, team standings, and scoring history.
* Reusable backend logic for multiple TV shows.
* Hosted self-contained on VPS with local DB and Firebase Auth.

---

## ⚙️ Tech Stack

| Layer                | Technology                                           |
| -------------------- | ---------------------------------------------------- |
| **Frontend**         | React + Vite + Tailwind + shadcn/ui                  |
| **Backend**          | Node.js + Express                                    |
| **Auth**             | Firebase Auth (Email/Password or Magic Link)         |
| **Database**         | MongoDB (via Docker in Coolify) or Supabase Postgres |
| **Deployment**       | VPS via Coolify                                      |
| **API Style**        | REST JSON                                            |
| **Frontend Hosting** | Coolify Static App (web/dist)                        |

---

## 🧱 Core Entities and Relationships

### Top-Level Structure

```
League → Teams → Players → ScoringEvents
        ↳ Weeks
        ↳ Invites
```

* Every entity references a `leagueId`.
* Each **league** can represent a season of *Survivor*, *Big Brother*, or any similar format.

---

## 🗃️ Database Schema (MongoDB JSON Schema / Mongoose Models)

### **User**

```json
{
  "uid": "firebase_user_id",
  "display_name": "Scott",
  "email": "scott@example.com",
  "role": "admin | player"
}
```

---

### **League**

* Root object defining a season or show instance.

```json
{
  "leagueName": "YAC Survivor Fantasy 2025",
  "ownerUid": "firebase_uid",
  "admins": ["firebase_uid"],
  "settings": {
    "show": "Survivor",
    "seasonLabel": "S49",
    "maxTeams": 8,
    "membersPerTeam": 2,
    "draft": {
      "type": "snake",
      "pickSeconds": 60,
      "randomizedOrder": true
    },
    "invites": {
      "allowTeamInvites": true,
      "allowLeagueInvites": true
    },
    "scoringRules": {
      "IMMUNITY_WIN": 5,
      "REWARD_WIN": 3,
      "FIND_IDOL": 4,
      "PLAY_IDOL_CORRECT": 6,
      "RECEIVES_VOTES_SURVIVES": 2,
      "MAKES_JURY": 3,
      "VOTED_OUT": -3,
      "QUIT_OR_MED": -6,
      "WINS_SEASON": 10
    }
  },
  "draftCompleted": false,
  "status": "setup | draft | active | final"
}
```

> Example for Big Brother:
>
> ```json
> "settings": {
>   "show": "Big Brother",
>   "seasonLabel": "BB27",
>   "scoringRules": {
>     "HOH_WIN": 5,
>     "VETO_WIN": 4,
>     "NOMINATED": -2,
>     "SAVED_FROM_NOMINATION": 3,
>     "EVICTED": -3,
>     "WINS_SEASON": 10
>   }
> }
> ```

---

### **Team**

```json
{
  "leagueId": "league_id",
  "name": "Team McBlasters",
  "members": ["firebase_uid_1", "firebase_uid_2"],
  "maxMembers": 2,
  "draftOrder": 1,
  "totalPoints": 20,
  "weeklyPoints": {
    "week_5": 15,
    "week_6": 5
  },
  "players": ["player_1", "player_2"]
}
```

---

### **Player**

(Generic schema for contestants, houseguests, etc.)

```json
{
  "leagueId": "league_id",
  "name": "Charlie",
  "photoUrl": "https://image.jpg",
  "meta": {
    "tribe": "Nami",
    "status": "active | voted_out | jury | finalist"
  },
  "draftedBy": "team_id",
  "totalPoints": 10,
  "weeklyPoints": {
    "week_5": 5
  }
}
```

---

### **Week**

```json
{
  "leagueId": "league_id",
  "weekNumber": 5,
  "episodeDate": "2025-10-09",
  "title": "Blind Faith",
  "status": "open | closed",
  "scoringFinalized": false
}
```

---

### **ScoringEvent**

```json
{
  "leagueId": "league_id",
  "week": 5,
  "player": "player_id",
  "type": "IMMUNITY_WIN",
  "description": "Charlie won immunity",
  "points": 5
}
```

---

### **Invite**

* Used for joining leagues or specific teams.

```json
{
  "leagueId": "league_id",
  "type": "league | team",
  "teamId": "team_id",
  "code": "ABC123",
  "multiUse": true,
  "uses": 0,
  "maxUses": 10,
  "expiresAt": "2025-10-15T00:00:00Z",
  "createdBy": "firebase_uid"
}
```

---

## 🧮 Scoring Logic

Each **league** defines its own `scoringRules`.
When an admin adds a scoring event, the app automatically:

1. Looks up the points for the event type.
2. Updates:

   * Player total + weekly points.
   * Team total + weekly points (if player is drafted).
3. Aggregates leaderboards in real-time.

---

## 🧩 API Specification (REST)

All endpoints prefixed with `/api`.

| Method  | Route                                     | Description                    | Auth         |
| ------- | ----------------------------------------- | ------------------------------ | ------------ |
| `POST`  | `/leagues`                                | Create a new league            | Auth         |
| `GET`   | `/leagues/mine`                           | Get leagues user belongs to    | Auth         |
| `GET`   | `/leagues/:leagueId`                      | Get league info                | Public       |
| `PATCH` | `/leagues/:leagueId/settings`             | Update league settings         | League Admin |
| `POST`  | `/leagues/:leagueId/status`               | Update league status           | League Admin |
| `POST`  | `/leagues/:leagueId/invites`              | Create invite (league or team) | League Admin |
| `POST`  | `/invites/redeem`                         | Redeem invite code             | Auth         |
| `POST`  | `/leagues/:leagueId/teams`                | Create team                    | Auth         |
| `POST`  | `/leagues/:leagueId/teams/:teamId/join`   | Join a team                    | Auth         |
| `GET`   | `/leagues/:leagueId/teams/leaderboard`    | Leaderboard standings          | Public       |
| `GET`   | `/leagues/:leagueId/players`              | Get all players                | Public       |
| `POST`  | `/leagues/:leagueId/players/import`       | Bulk import player list        | League Admin |
| `POST`  | `/leagues/:leagueId/draft/start`          | Initialize draft order         | League Admin |
| `POST`  | `/leagues/:leagueId/draft/pick`           | Make draft pick                | Auth         |
| `POST`  | `/leagues/:leagueId/draft/reset`          | Reset draft                    | League Admin |
| `POST`  | `/leagues/:leagueId/scoring/add`          | Add scoring event              | League Admin |
| `GET`   | `/leagues/:leagueId/scoring/week/:week`   | Get weekly scoring summary     | Public       |
| `GET`   | `/leagues/:leagueId/weeks`                | List episodes/weeks            | Public       |
| `PATCH` | `/leagues/:leagueId/weeks/:week/finalize` | Finalize scoring               | League Admin |

---

## 🧠 Core Logic Summary

### Draft Flow

* League Admin starts draft → order randomized if enabled.
* Teams pick players in snake order.
* When a player is drafted:

  * Mark `player.draftedBy = team_id`.
  * Add player to team’s `players` list.

### Scoring Flow

* Admin enters scoring events weekly.
* Each event updates player and team totals.
* Weekly scores can be finalized to lock results.

### Invite Flow

* Admin creates invite code (league or team).
* User redeems code:

  * League invite → joins league, creates team.
  * Team invite → joins specific team.
* Invite usage tracked to prevent overuse.

---

## 🖥️ Frontend Features

### 1. **Auth**

* Firebase login/signup (Email/Password)
* Store ID token in localStorage
* Redirect to `/league-switcher` after login

### 2. **League Switcher**

* List of leagues from `/leagues/mine`
* Create or join via invite code
* Store selected `leagueId` in localStorage

### 3. **Dashboard**

* Team name, members, total score
* Player cards (photo, score, status)
* Weekly points chart
* Quick link to Leaderboard

### 4. **Leaderboard**

* Rank teams by total score
* Filter by week
* Responsive, mobile-first grid

### 5. **Draft Room**

* Show available players
* Real-time draft board
* Pick button for eligible teams
* Admin controls: start/reset draft

### 6. **Admin Panel**

* **Settings Tab:** edit league rules, scoring values, limits
* **Players Tab:** bulk import/edit player list
* **Invites Tab:** generate codes for teams or league
* **Draft Tab:** start/reset draft
* **Scoring Tab:** add events, finalize weeks

---

## 🎨 UI Design System

| Element           | Description                                               |
| ----------------- | --------------------------------------------------------- |
| **Primary Color** | `#1e40af` (Carolina Blue)                                 |
| **Accent Color**  | `#fbbf24` (Gold)                                          |
| **Background**    | `#0f172a` (Slate 950)                                     |
| **Typography**    | Inter / sans-serif                                        |
| **Components**    | Cards, Tables, Buttons, Modals, Badges, Charts (Recharts) |
| **Layout**        | Dark theme, centered container, mobile responsive grid    |

---

## 📊 Example JSON Seed Data

```json
{
  "league": {
    "leagueName": "YAC Survivor Fantasy 2025",
    "settings": {
      "show": "Survivor",
      "seasonLabel": "S49",
      "maxTeams": 8,
      "membersPerTeam": 2
    }
  },
  "teams": [
    { "name": "Team A" },
    { "name": "Team B" },
    { "name": "Team C" },
    { "name": "Team D" }
  ],
  "players": [
    { "name": "Charlie", "meta": { "tribe": "Nami" } },
    { "name": "Hunter", "meta": { "tribe": "Nami" } },
    { "name": "Venus", "meta": { "tribe": "Siga" } },
    { "name": "Kenzie", "meta": { "tribe": "Siga" } },
    { "name": "Ben", "meta": { "tribe": "Yanu" } },
    { "name": "Maria", "meta": { "tribe": "Yanu" } },
    { "name": "Tevin", "meta": { "tribe": "Nami" } },
    { "name": "Q", "meta": { "tribe": "Siga" } },
    { "name": "Liz", "meta": { "tribe": "Yanu" } },
    { "name": "Tiffany", "meta": { "tribe": "Siga" } },
    { "name": "Kendra", "meta": { "tribe": "Nami" } },
    { "name": "Austin", "meta": { "tribe": "Siga" } },
    { "name": "Dee", "meta": { "tribe": "Yanu" } },
    { "name": "Soda", "meta": { "tribe": "Yanu" } },
    { "name": "Taylor", "meta": { "tribe": "Nami" } },
    { "name": "Mariah", "meta": { "tribe": "Siga" } }
  ],
  "weeks": [
    { "weekNumber": 1, "title": "Premiere" },
    { "weekNumber": 2, "title": "Episode 2" },
    { "weekNumber": 3, "title": "Episode 3" },
    { "weekNumber": 4, "title": "Episode 4" },
    { "weekNumber": 5, "title": "Episode 5" }
  ]
}
```

---

## 🧭 Future Enhancements

* Live scoring updates or webhook integration.
* Multi-league dashboard for commissioners.
* Automated score calculation via script input (CSV → API).
* Push/email notifications for weekly results.
* In-app chat or comment feed.
* Automated draft clock and queue.

---

## ✅ Success Criteria

MVP is complete when:

* Users can log in via Firebase Auth.
* League admin can:

  * Create a league
  * Import players
  * Create invites
  * Run draft
  * Input weekly scoring
* Teams and players show up correctly on the leaderboard.
* App runs locally and on VPS via Coolify with Mongo container.

---

## 📁 Recommended Folder Structure

```
survivor-fantasy/
 ├── server/
 │   ├── src/
 │   │   ├── models/
 │   │   ├── routes/
 │   │   ├── middleware/
 │   │   ├── lib/
 │   │   └── index.js
 │   └── package.json
 ├── web/
 │   ├── src/
 │   │   ├── pages/
 │   │   ├── lib/
 │   │   ├── components/
 │   │   └── main.jsx
 │   └── package.json
 ├── docs/
 │   └── PRD.md  ← (this file)
 └── README.md
```

---

## 🔄 Reuse for Other Shows

To adapt for another show (e.g., *Big Brother*):

1. Create new League:

   ```bash
   POST /api/leagues
   {
     "leagueName": "Big Brother 27 Fantasy",
     "settings": {
       "show": "Big Brother",
       "seasonLabel": "BB27",
       "maxTeams": 10,
       "membersPerTeam": 2,
       "scoringRules": {
         "HOH_WIN": 5,
         "VETO_WIN": 4,
         "NOMINATED": -2,
         "SAVED_FROM_NOMINATION": 3,
         "EVICTED": -3,
         "WINS_SEASON": 10
       }
     }
   }
   ```
2. Import houseguest list using `/players/import`.
3. Draft and score using the same UI and endpoints.

---

### 🧩 End of PRD File
