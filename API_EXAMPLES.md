# YAC Fantasy League - API Examples

This document provides cURL examples for all API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require a Firebase ID token. Include it in the Authorization header:

```bash
Authorization: Bearer YOUR_FIREBASE_ID_TOKEN
```

---

## Health Check

```bash
curl http://localhost:3000/health
```

---

## League Routes

### Create a League

```bash
curl -X POST http://localhost:3000/api/leagues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leagueName": "YAC Survivor Fantasy 2025",
    "settings": {
      "show": "Survivor",
      "seasonLabel": "S49",
      "maxTeams": 8,
      "membersPerTeam": 2,
      "scoringRules": {
        "IMMUNITY_WIN": 5,
        "REWARD_WIN": 3,
        "FIND_IDOL": 4,
        "VOTED_OUT": -3,
        "WINS_SEASON": 10
      }
    }
  }'
```

### Get My Leagues

```bash
curl http://localhost:3000/api/leagues/mine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get League by ID

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID
```

### Update League Settings

```bash
curl -X PATCH http://localhost:3000/api/leagues/LEAGUE_ID/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "settings": {
      "scoringRules": {
        "IMMUNITY_WIN": 6,
        "REWARD_WIN": 4,
        "VOTED_OUT": -4
      }
    }
  }'
```

### Update League Status

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "draft"
  }'
```

---

## Team Routes

### Create a Team

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Team Alpha"
  }'
```

### Get All Teams

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/teams
```

### Get Leaderboard

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/teams/leaderboard
```

### Join a Team

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/teams/TEAM_ID/join \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Player Routes

### Get All Players

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/players
```

### Import Players (Bulk)

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/players/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "players": [
      {"name": "Charlie", "tribe": "Nami"},
      {"name": "Hunter", "tribe": "Nami"},
      {"name": "Venus", "tribe": "Siga"}
    ]
  }'
```

### Update a Player

```bash
curl -X PATCH http://localhost:3000/api/leagues/LEAGUE_ID/players/PLAYER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Charlie Updated",
    "meta": {
      "tribe": "Nami",
      "status": "active"
    }
  }'
```

### Delete a Player

```bash
curl -X DELETE http://localhost:3000/api/leagues/LEAGUE_ID/players/PLAYER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Draft Routes

### Start Draft

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/draft/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Make a Draft Pick

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/draft/pick \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "playerId": "PLAYER_ID",
    "teamId": "TEAM_ID"
  }'
```

### Reset Draft

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/draft/reset \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Draft Status

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/draft/status
```

---

## Scoring Routes

### Add Scoring Event

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/scoring/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "week": 5,
    "playerId": "PLAYER_ID",
    "type": "IMMUNITY_WIN",
    "description": "Charlie won immunity challenge"
  }'
```

### Get Weekly Scoring

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/scoring/week/5
```

### Delete Scoring Event

```bash
curl -X DELETE http://localhost:3000/api/leagues/LEAGUE_ID/scoring/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Week Routes

### Get All Weeks

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/weeks
```

### Create a Week

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/weeks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "weekNumber": 5,
    "title": "Blind Faith",
    "episodeDate": "2025-10-09"
  }'
```

### Bulk Create Weeks

```bash
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/weeks/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "weeks": [
      {"weekNumber": 1, "title": "Premiere"},
      {"weekNumber": 2, "title": "Episode 2"},
      {"weekNumber": 3, "title": "Episode 3"}
    ]
  }'
```

### Finalize Week

```bash
curl -X PATCH http://localhost:3000/api/leagues/LEAGUE_ID/weeks/5/finalize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Invite Routes

### Create Invite

```bash
# League invite
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/invites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "league",
    "multiUse": true,
    "maxUses": 10
  }'

# Team invite
curl -X POST http://localhost:3000/api/leagues/LEAGUE_ID/invites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "team",
    "teamId": "TEAM_ID",
    "multiUse": false
  }'
```

### Get All Invites

```bash
curl http://localhost:3000/api/leagues/LEAGUE_ID/invites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Redeem Invite

```bash
# For league invites, provide a team name
curl -X POST http://localhost:3000/api/invites/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "ABC12345",
    "teamName": "My New Team"
  }'

# For team invites, team name is optional
curl -X POST http://localhost:3000/api/invites/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "XYZ98765"
  }'
```

---

## Complete Workflow Example

Here's a complete workflow to set up and run a fantasy league:

```bash
# 1. Create a league
LEAGUE=$(curl -X POST http://localhost:3000/api/leagues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"leagueName": "Test League", "settings": {"show": "Survivor", "seasonLabel": "S1"}}' \
  | jq -r '._id')

# 2. Import players
curl -X POST http://localhost:3000/api/leagues/$LEAGUE/players/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"players": [{"name": "Charlie"}, {"name": "Hunter"}]}'

# 3. Create teams
curl -X POST http://localhost:3000/api/leagues/$LEAGUE/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Team Alpha"}'

# 4. Start draft
curl -X POST http://localhost:3000/api/leagues/$LEAGUE/draft/start \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Create weeks
curl -X POST http://localhost:3000/api/leagues/$LEAGUE/weeks/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"weeks": [{"weekNumber": 1, "title": "Week 1"}]}'

# 6. Add scoring event
curl -X POST http://localhost:3000/api/leagues/$LEAGUE/scoring/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"week": 1, "playerId": "PLAYER_ID", "type": "IMMUNITY_WIN"}'

# 7. View leaderboard
curl http://localhost:3000/api/leagues/$LEAGUE/teams/leaderboard
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
