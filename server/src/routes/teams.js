import express from 'express';
import Team from '../models/Team.js';
import League from '../models/League.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateTeamName } from '../lib/validation.js';

const router = express.Router();

/**
 * POST /api/leagues/:leagueId/teams - Create team
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { name } = req.body;
    const { uid } = req.user;

    const validatedName = validateTeamName(name);

    // Verify league exists
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Check if user already has a team in this league
    const existingTeam = await Team.findOne({ leagueId, members: uid });
    if (existingTeam) {
      return res.status(400).json({ error: 'You already belong to a team in this league' });
    }

    // Check team limit
    const teamCount = await Team.countDocuments({ leagueId });
    if (teamCount >= league.settings.maxTeams) {
      return res.status(400).json({ error: 'League has reached maximum teams' });
    }

    const team = await Team.create({
      leagueId,
      name: validatedName,
      members: [uid],
      maxMembers: league.settings.membersPerTeam,
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/teams/:teamId/join - Join a team
 */
router.post('/:teamId/join', authenticateUser, async (req, res) => {
  try {
    const { leagueId, teamId } = req.params;
    const { uid } = req.user;

    // Check if user already has a team in this league
    const existingTeam = await Team.findOne({ leagueId, members: uid });
    if (existingTeam) {
      return res.status(400).json({ error: 'You already belong to a team in this league' });
    }

    const team = await Team.findOne({ _id: teamId, leagueId });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ error: 'Team is full' });
    }

    team.members.push(uid);
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/:leagueId/teams/leaderboard - Team standings
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { leagueId } = req.params;

    const teams = await Team.find({ leagueId })
      .populate('players', 'name photoUrl totalPoints')
      .sort({ totalPoints: -1 })
      .lean();

    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/:leagueId/teams - Get all teams
 */
router.get('/', async (req, res) => {
  try {
    const { leagueId } = req.params;

    const teams = await Team.find({ leagueId })
      .populate('players', 'name photoUrl totalPoints')
      .sort({ draftOrder: 1 })
      .lean();

    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
