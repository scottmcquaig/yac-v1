import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import { initializeFirebase } from './lib/firebase.js';

// Import routes
import leaguesRouter from './routes/leagues.js';
import teamsRouter from './routes/teams.js';
import playersRouter from './routes/players.js';
import draftRouter from './routes/draft.js';
import scoringRouter from './routes/scoring.js';
import weeksRouter from './routes/weeks.js';
import invitesRouter from './routes/invites.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Initialize Firebase
initializeFirebase();

// Connect to MongoDB
connectDB();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'YAC Fantasy League API' });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'YAC Fantasy League API v1' });
});

// League routes
app.use('/api/leagues', leaguesRouter);

// League-scoped routes - teams
app.use('/api/leagues/:leagueId/teams', teamsRouter);

// League-scoped routes - players
app.use('/api/leagues/:leagueId/players', playersRouter);

// League-scoped routes - draft
app.use('/api/leagues/:leagueId/draft', draftRouter);

// League-scoped routes - scoring
app.use('/api/leagues/:leagueId/scoring', scoringRouter);

// League-scoped routes - weeks
app.use('/api/leagues/:leagueId/weeks', weeksRouter);

// League-scoped routes - invites
app.use('/api/leagues/:leagueId/invites', invitesRouter);

// Global invite redemption
app.use('/api/invites', invitesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});
