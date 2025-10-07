# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**YAC Reality TV Fantasy League** - A multi-league fantasy game for reality competition shows (Survivor, Big Brother, etc.). Users join private leagues, draft contestants, and earn points weekly based on configurable event rules.

## Tech Stack

- **Frontend**: React + Vite + Tailwind + shadcn/ui
- **Backend**: Node.js + Express (REST API)
- **Auth**: Firebase Auth (Email/Password or Magic Link)
- **Database**: MongoDB (via Docker in Coolify) or Supabase Postgres
- **Deployment**: VPS via Coolify

## Project Structure

```
/root/yac-v1/
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── models/      # Mongoose/database models
│   │   ├── routes/      # API route handlers
│   │   ├── middleware/  # Auth, validation, error handling
│   │   ├── lib/         # Utilities and helpers
│   │   └── index.js     # Server entry point
│   └── package.json
├── web/             # React frontend (to be created)
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── lib/         # API client, utilities
│   │   ├── components/  # Reusable UI components
│   │   └── main.jsx     # App entry point
│   └── package.json
└── docs/
    └── PRD.md       # Full product requirements
```

## Core Architecture

### Data Model Hierarchy

```
League → Teams → Players → ScoringEvents
        ↳ Weeks
        ↳ Invites
```

All entities reference a `leagueId` to support multiple independent fantasy leagues for different shows/seasons.

### Key Entities

- **League**: Root object defining a season/show with configurable scoring rules, draft settings, and admin permissions
- **Team**: Group of 1-N users competing together, owns drafted players
- **Player**: Contestant/houseguest in the show (generic schema supports any reality competition format)
- **Week**: Represents an episode with scoring events
- **ScoringEvent**: Individual event (e.g., "IMMUNITY_WIN", "VOTED_OUT") tied to a player and week
- **Invite**: Code-based system for joining leagues or specific teams
- **User**: Firebase-authenticated user with admin or player role

### Scoring System

Each league defines custom `scoringRules` (e.g., `{"IMMUNITY_WIN": 5, "VOTED_OUT": -3}`). When admins add scoring events:

1. Points calculated from league's scoring rules
2. Player's `totalPoints` and `weeklyPoints` updated
3. Team's totals updated automatically (if player is drafted)
4. Leaderboards reflect changes immediately

### Draft System

- **Snake draft**: Teams pick players in order, then reverse order each round
- Draft order can be randomized
- When a player is drafted: `player.draftedBy = team_id` and added to `team.players[]`

## API Routes

All routes prefixed with `/api`. Key endpoints:

**League Management**
- `POST /leagues` - Create league
- `GET /leagues/mine` - Get user's leagues
- `PATCH /leagues/:leagueId/settings` - Update league config (admin only)

**Teams & Players**
- `POST /leagues/:leagueId/teams` - Create team
- `GET /leagues/:leagueId/teams/leaderboard` - Team standings
- `POST /leagues/:leagueId/players/import` - Bulk import contestants (admin only)

**Draft**
- `POST /leagues/:leagueId/draft/start` - Initialize draft order (admin only)
- `POST /leagues/:leagueId/draft/pick` - Make draft pick
- `POST /leagues/:leagueId/draft/reset` - Reset draft (admin only)

**Scoring**
- `POST /leagues/:leagueId/scoring/add` - Add scoring event (admin only)
- `GET /leagues/:leagueId/scoring/week/:week` - Weekly scoring summary
- `PATCH /leagues/:leagueId/weeks/:week/finalize` - Lock weekly scores (admin only)

**Invites**
- `POST /leagues/:leagueId/invites` - Generate invite code (admin only)
- `POST /invites/redeem` - Redeem invite code

See `/root/yac-v1/docs/PRD.md` lines 233-257 for complete API specification.

## Authentication Pattern

- Firebase ID tokens stored in localStorage
- Backend middleware validates tokens on protected routes
- League admin permissions checked via `league.admins[]` array
- User's `uid` matches Firebase Auth `uid`

## Multi-Show Support

The system is designed to support any reality competition show. To add a new show:

1. Create league with custom `settings.show` (e.g., "Big Brother")
2. Define show-specific `scoringRules` (e.g., `{"HOH_WIN": 5, "VETO_WIN": 4}`)
3. Import contestants via `/players/import`
4. Use same draft, scoring, and leaderboard logic

See PRD.md lines 449-477 for Big Brother example.

## Design System

- **Dark theme**: Background `#0f172a` (Slate 950)
- **Primary**: `#1e40af` (Carolina Blue)
- **Accent**: `#fbbf24` (Gold)
- **Typography**: Inter / sans-serif
- **Components**: shadcn/ui for Cards, Tables, Buttons, Modals, Badges
- **Charts**: Recharts for weekly points visualization
- Mobile-first responsive design

## Development Commands

**Note**: As of this writing, the codebase is in early setup phase. The following commands are expected once implementation begins:

**Server (Node.js)**
```bash
cd server
npm install
npm run dev        # Start development server
npm test           # Run tests
```

**Web (React + Vite)**
```bash
cd web
npm install
npm run dev        # Start Vite dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Firebase Setup

The app requires Firebase Auth configuration. Create a Firebase project and add:

**Server**: Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` environment variables

**Web**: Add Firebase config object to frontend environment variables

## Database Choice

The PRD supports both MongoDB and Supabase Postgres. Current recommendation is MongoDB for:
- Flexible schema (supports evolving league settings/scoring rules)
- Easy nested document structure (weeklyPoints objects)
- Simple deployment via Docker container in Coolify

## Success Criteria (MVP)

MVP is complete when:
- Users can authenticate via Firebase
- League admin can create league, import players, generate invites, run draft, input weekly scoring
- Teams and players display correctly on leaderboard
- App runs locally and on VPS via Coolify with database container

See PRD.md lines 406-420 for full success criteria.
