import express from 'express';
import Week from '../models/Week.js';
import League from '../models/League.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireLeagueAdmin } from '../middleware/authorize.js';
import { validateNumber } from '../lib/validation.js';

const router = express.Router();

/**
 * GET /api/leagues/:leagueId/weeks - List all weeks
 */
router.get('/', async (req, res) => {
  try {
    const { leagueId } = req.params;

    const weeks = await Week.find({ leagueId }).sort({ weekNumber: 1 });

    res.json(weeks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/weeks - Create a week
 */
router.post('/', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { weekNumber, episodeDate, title } = req.body;

    const validatedWeek = validateNumber(weekNumber, 1, 100, 'Week number');

    // Check if week already exists
    const existing = await Week.findOne({ leagueId, weekNumber: validatedWeek });
    if (existing) {
      return res.status(400).json({ error: 'Week already exists' });
    }

    const week = await Week.create({
      leagueId,
      weekNumber: validatedWeek,
      episodeDate: episodeDate || null,
      title: title || `Week ${validatedWeek}`,
    });

    res.status(201).json(week);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/leagues/:leagueId/weeks/:week/finalize - Finalize weekly scoring
 */
router.patch('/:week/finalize', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId, week } = req.params;

    const validatedWeek = validateNumber(week, 1, 100, 'Week');

    const weekDoc = await Week.findOne({ leagueId, weekNumber: validatedWeek });

    if (!weekDoc) {
      return res.status(404).json({ error: 'Week not found' });
    }

    weekDoc.scoringFinalized = true;
    weekDoc.status = 'closed';
    await weekDoc.save();

    res.json(weekDoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/weeks/bulk - Bulk create weeks
 */
router.post('/bulk', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { weeks } = req.body;

    if (!Array.isArray(weeks) || weeks.length === 0) {
      return res.status(400).json({ error: 'Weeks array required' });
    }

    const validatedWeeks = weeks.map(w => ({
      leagueId,
      weekNumber: validateNumber(w.weekNumber, 1, 100, 'Week number'),
      episodeDate: w.episodeDate || null,
      title: w.title || `Week ${w.weekNumber}`,
    }));

    const createdWeeks = await Week.insertMany(validatedWeeks, { ordered: false });

    res.status(201).json({
      message: `${createdWeeks.length} weeks created`,
      weeks: createdWeeks,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
