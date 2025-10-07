import express from 'express';
import League from '../models/League.js';
import Team from '../models/Team.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireLeagueAdmin } from '../middleware/authorize.js';
import { validateLeagueName, validateNumber, validateEnum, validateScoringRules } from '../lib/validation.js';

const router = express.Router();

/**
 * POST /api/leagues - Create a new league
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { leagueName, settings } = req.body;
    const { uid } = req.user;

    const validatedName = validateLeagueName(leagueName);

    const league = await League.create({
      leagueName: validatedName,
      ownerUid: uid,
      admins: [uid],
      settings: {
        show: settings?.show || 'Survivor',
        seasonLabel: settings?.seasonLabel || 'S1',
        maxTeams: settings?.maxTeams ? validateNumber(settings.maxTeams, 2, 20, 'Max teams') : 8,
        membersPerTeam: settings?.membersPerTeam ? validateNumber(settings.membersPerTeam, 1, 10, 'Members per team') : 2,
        draft: settings?.draft || {},
        invites: settings?.invites || {},
        scoringRules: settings?.scoringRules ? validateScoringRules(settings.scoringRules) : {},
      },
    });

    res.status(201).json(league);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/mine - Get leagues user belongs to
 */
router.get('/mine', authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;

    // Find leagues where user is owner or admin, or member of a team
    const teams = await Team.find({ members: uid }).select('leagueId');
    const teamLeagueIds = teams.map(t => t.leagueId);

    const leagues = await League.find({
      $or: [
        { ownerUid: uid },
        { admins: uid },
        { _id: { $in: teamLeagueIds } },
      ],
    }).sort({ createdAt: -1 });

    res.json(leagues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/:leagueId - Get league info
 */
router.get('/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;

    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json(league);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/leagues/:leagueId/settings - Update league settings
 */
router.patch('/:leagueId/settings', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object required' });
    }

    const updateData = {};

    if (settings.show) updateData['settings.show'] = settings.show;
    if (settings.seasonLabel) updateData['settings.seasonLabel'] = settings.seasonLabel;
    if (settings.maxTeams !== undefined) {
      updateData['settings.maxTeams'] = validateNumber(settings.maxTeams, 2, 20, 'Max teams');
    }
    if (settings.membersPerTeam !== undefined) {
      updateData['settings.membersPerTeam'] = validateNumber(settings.membersPerTeam, 1, 10, 'Members per team');
    }
    if (settings.draft) updateData['settings.draft'] = settings.draft;
    if (settings.invites) updateData['settings.invites'] = settings.invites;
    if (settings.scoringRules) {
      updateData['settings.scoringRules'] = validateScoringRules(settings.scoringRules);
    }

    const league = await League.findByIdAndUpdate(
      leagueId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(league);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/status - Update league status
 */
router.post('/:leagueId/status', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { status } = req.body;

    const validStatus = validateEnum(status, ['setup', 'draft', 'active', 'final'], 'Status');

    const league = await League.findByIdAndUpdate(
      leagueId,
      { status: validStatus },
      { new: true }
    );

    res.json(league);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
