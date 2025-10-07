import express from 'express';
import ScoringEvent from '../models/ScoringEvent.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import League from '../models/League.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireLeagueAdmin } from '../middleware/authorize.js';
import { validateNumber } from '../lib/validation.js';

const router = express.Router();

/**
 * POST /api/leagues/:leagueId/scoring/add - Add scoring event
 */
router.post('/add', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { week, playerId, type, description } = req.body;

    // Validate inputs
    const validatedWeek = validateNumber(week, 1, 100, 'Week');

    if (!playerId || !type) {
      return res.status(400).json({ error: 'Player ID and event type required' });
    }

    // Get league to look up points
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const scoringRules = Object.fromEntries(league.settings.scoringRules);
    const points = scoringRules[type.toUpperCase()];

    if (points === undefined) {
      return res.status(400).json({
        error: `Event type '${type}' not found in scoring rules`,
      });
    }

    // Get player
    const player = await Player.findOne({ _id: playerId, leagueId });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Create scoring event
    const scoringEvent = await ScoringEvent.create({
      leagueId,
      week: validatedWeek,
      player: playerId,
      type: type.toUpperCase(),
      description: description || '',
      points,
    });

    // Update player points
    const weekKey = `week_${validatedWeek}`;
    const currentWeekPoints = player.weeklyPoints.get(weekKey) || 0;
    player.weeklyPoints.set(weekKey, currentWeekPoints + points);
    player.totalPoints += points;
    await player.save();

    // Update team points if player is drafted
    if (player.draftedBy) {
      const team = await Team.findById(player.draftedBy);
      if (team) {
        const teamWeekPoints = team.weeklyPoints.get(weekKey) || 0;
        team.weeklyPoints.set(weekKey, teamWeekPoints + points);
        team.totalPoints += points;
        await team.save();
      }
    }

    res.status(201).json({
      message: 'Scoring event added',
      event: scoringEvent,
      player,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/:leagueId/scoring/week/:week - Get weekly scoring
 */
router.get('/week/:week', async (req, res) => {
  try {
    const { leagueId, week } = req.params;

    const validatedWeek = validateNumber(week, 1, 100, 'Week');

    const events = await ScoringEvent.find({ leagueId, week: validatedWeek })
      .populate('player', 'name photoUrl')
      .sort({ createdAt: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/leagues/:leagueId/scoring/:eventId - Delete scoring event
 */
router.delete('/:eventId', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId, eventId } = req.params;

    const event = await ScoringEvent.findOne({ _id: eventId, leagueId });
    if (!event) {
      return res.status(404).json({ error: 'Scoring event not found' });
    }

    // Reverse the points
    const player = await Player.findById(event.player);
    if (player) {
      const weekKey = `week_${event.week}`;
      const currentWeekPoints = player.weeklyPoints.get(weekKey) || 0;
      player.weeklyPoints.set(weekKey, currentWeekPoints - event.points);
      player.totalPoints -= event.points;
      await player.save();

      // Update team
      if (player.draftedBy) {
        const team = await Team.findById(player.draftedBy);
        if (team) {
          const teamWeekPoints = team.weeklyPoints.get(weekKey) || 0;
          team.weeklyPoints.set(weekKey, teamWeekPoints - event.points);
          team.totalPoints -= event.points;
          await team.save();
        }
      }
    }

    await event.deleteOne();

    res.json({ message: 'Scoring event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
