# YAC Reality TV Fantasy League

A multi-league fantasy game for reality competition shows (Survivor, Big Brother, etc.). Users join private leagues, draft contestants, and earn points weekly based on configurable event rules.

## 🎯 Features

- **Multi-League Support**: Create separate leagues for different shows/seasons
- **Snake Draft System**: Randomized team order with snake-style drafting
- **Flexible Scoring**: Configure custom scoring rules per league
- **Admin Controls**: Complete admin panel for managing players, scoring, and settings
- **Real-time Leaderboards**: Track team standings and player performance
- **Invite System**: Generate codes for league or team invitations
- **Draft Board**: Visual grid showing all draft picks by team and round

## 🧱 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Sonner (toasts)
- **Backend**: Node.js + Express + Mongoose
- **Auth**: Firebase Authentication
- **Database**: MongoDB
- **Deployment**: Coolify-ready

## 📁 Project Structure

```
/root/yac-v1/
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes (league-scoped)
│   │   ├── middleware/  # Auth & admin authorization
│   │   ├── lib/         # Utilities (validation, Firebase, DB)
│   │   └── scripts/     # Seed script
│   └── package.json
├── web/             # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # LeagueSwitcher, Dashboard, AdminPanel
│   │   ├── components/  # DraftBoard
│   │   └── lib/         # API client, Firebase config
│   └── package.json
├── docs/
│   └── PRD.md           # Full product requirements
└── API_EXAMPLES.md      # cURL examples for all routes
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local, Docker, or cloud)
- Firebase project with Authentication enabled

### 1. Clone and Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../web
npm install
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):

```bash
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173,http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/yac-fantasy

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Frontend** (`web/.env`):

```bash
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

### 3. Start MongoDB

**Option A: Docker**
```bash
docker run -d -p 27017:27017 --name yac-mongo mongo:latest
```

**Option B: Local Installation**
```bash
mongod --dbpath /path/to/data
```

### 4. Seed Database (Optional)

```bash
cd server
npm run seed
```

This creates sample data including:
- 1 league (Survivor S49)
- 4 teams
- 16 players
- 5 weeks

### 5. Run the Servers

**Backend:**
```bash
cd server
npm run dev
# Runs on http://localhost:3000
```

**Frontend:**
```bash
cd web
npm run dev
# Runs on http://localhost:5173
```

### 6. Build for Production

**Frontend:**
```bash
cd web
npm run build
# Output in web/dist/
```

**Backend:**
```bash
cd server
npm start
```

## 🎮 Usage

### Admin Workflow

1. **Create a League**
   - Navigate to `/leagues`
   - Click "Create New League"
   - Configure show, season, and scoring rules

2. **Import Players**
   - Go to Admin Panel → Players tab
   - Enter player names (one per line, with optional tribe)
   - Click Import

3. **Generate Invites**
   - Admin Panel → Invites tab
   - Choose "league" or "team" type
   - Share the generated code

4. **Start Draft**
   - Admin Panel → Draft tab
   - Click "Start Draft" (randomizes team order)
   - Teams can now make picks

5. **Add Weekly Scoring**
   - Admin Panel → Scoring tab
   - Select week, player, and event type
   - Points automatically update teams and leaderboard

6. **Finalize Weeks**
   - Admin Panel → Weeks tab
   - Click "Finalize" to lock weekly scores

### Player Workflow

1. **Join League**
   - Enter invite code
   - Create or join a team

2. **View Dashboard**
   - See leaderboard rankings
   - View draft board (during draft)
   - Track team performance

## 📡 API Endpoints

All routes are league-scoped under `/api/leagues/:leagueId`. See [API_EXAMPLES.md](./API_EXAMPLES.md) for complete cURL examples.

### Key Routes

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/leagues` | Create league | ✓ |
| `GET` | `/api/leagues/mine` | Get user's leagues | ✓ |
| `POST` | `/api/leagues/:leagueId/teams` | Create team | ✓ |
| `GET` | `/api/leagues/:leagueId/teams/leaderboard` | Get standings | Public |
| `POST` | `/api/leagues/:leagueId/players/import` | Bulk import players | Admin |
| `POST` | `/api/leagues/:leagueId/draft/start` | Start draft | Admin |
| `POST` | `/api/leagues/:leagueId/draft/pick` | Make draft pick | ✓ |
| `POST` | `/api/leagues/:leagueId/scoring/add` | Add scoring event | Admin |
| `GET` | `/api/leagues/:leagueId/scoring/week/:week` | Get weekly scores | Public |
| `POST` | `/api/leagues/:leagueId/invites` | Generate invite code | Admin |
| `POST` | `/api/invites/redeem` | Redeem invite | ✓ |

**Legend**: ✓ = Requires auth, Admin = Requires league admin

## 🧪 Testing with cURL

```bash
# Health check
curl http://localhost:3000/health

# Create a league
curl -X POST http://localhost:3000/api/leagues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "leagueName": "Test League",
    "settings": {
      "show": "Survivor",
      "seasonLabel": "S1",
      "scoringRules": {
        "IMMUNITY_WIN": 5,
        "VOTED_OUT": -3
      }
    }
  }'

# Get leaderboard
curl http://localhost:3000/api/leagues/LEAGUE_ID/teams/leaderboard
```

See [API_EXAMPLES.md](./API_EXAMPLES.md) for full workflow examples.

## 🔒 Security

- **CORS**: Configured via `ALLOWED_ORIGIN` environment variable (comma-separated)
- **Authentication**: Firebase ID tokens validated on protected routes
- **Authorization**: League admins checked via `admins[]` array
- **Input Validation**: All inputs sanitized with unit-safe validators

## 🎨 UI Components

- **League Switcher**: Select/create/join leagues with localStorage persistence
- **Dashboard**: Leaderboard + Draft Board
- **Admin Panel**: 6 tabs (Settings, Invites, Players, Draft, Scoring, Weeks)
- **Draft Board**: Read-only grid showing picks by team × round
- **Toast Notifications**: Success/error alerts for all admin actions

## 📦 Deployment

### Coolify Deployment

1. **Backend Service:**
   - Type: Docker
   - Build: `cd server && npm install && npm start`
   - Port: 3000
   - Environment: Set all variables from `.env.example`

2. **Frontend Static App:**
   - Build: `cd web && npm run build`
   - Output: `web/dist`
   - Serve via Nginx/Caddy

3. **MongoDB:**
   - Deploy MongoDB container in Coolify
   - Set `MONGODB_URI` to connection string

## 🧩 Multi-Show Support

To add another show (e.g., Big Brother):

```bash
curl -X POST http://localhost:3000/api/leagues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "leagueName": "Big Brother 27",
    "settings": {
      "show": "Big Brother",
      "seasonLabel": "BB27",
      "scoringRules": {
        "HOH_WIN": 5,
        "VETO_WIN": 4,
        "EVICTED": -3
      }
    }
  }'
```

Import houseguests, run draft, and score using the same endpoints!

## 🐛 Troubleshooting

**MongoDB Connection Failed:**
- Verify MongoDB is running: `mongosh` or `docker ps`
- Check `MONGODB_URI` in `.env`

**CORS Errors:**
- Add frontend URL to `ALLOWED_ORIGIN` in backend `.env`
- Restart backend server

**Firebase Auth Errors:**
- Verify Firebase credentials in both `.env` files
- Check Firebase project has Authentication enabled

**Seed Script Fails:**
- Ensure MongoDB is running
- Check `.env` variables are set
- Run: `npm run seed` from `server/` directory

## 📚 Documentation

- [PRD.md](docs/PRD.md) - Full product requirements
- [API_EXAMPLES.md](API_EXAMPLES.md) - cURL examples for all routes
- [SETUP.md](SETUP.md) - Initial setup checklist

## 📄 License

MIT

---

**Built with ⚡ for reality TV fans**
