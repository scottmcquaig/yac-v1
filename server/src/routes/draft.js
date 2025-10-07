import express from 'express';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import League from '../models/League.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireLeagueAdmin } from '../middleware/authorize.js';
import { shuffleArray, calculateSnakeDraftOrder } from '../lib/utils.js';

const router = express.Router();

/**
 * POST /api/leagues/:leagueId/draft/start - Initialize draft
 */
router.post('/start', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;

    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    if (league.status !== 'setup') {
      return res.status(400).json({ error: 'Draft can only be started from setup status' });
    }

    // Get all teams
    const teams = await Team.find({ leagueId });

    if (teams.length === 0) {
      return res.status(400).json({ error: 'No teams found. Create teams before starting draft' });
    }

    // Assign draft order
    let draftOrder = teams.map((_, index) => index + 1);

    if (league.settings.draft.randomizedOrder) {
      draftOrder = shuffleArray(draftOrder);
    }

    // Update teams with draft order
    await Promise.all(
      teams.map((team, index) =>
        Team.findByIdAndUpdate(team._id, { draftOrder: draftOrder[index] })
      )
    );

    // Update league status
    league.status = 'draft';
    await league.save();

    res.json({
      message: 'Draft started',
      draftOrder,
      league,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/draft/pick - Make a draft pick
 */
router.post('/pick', authenticateUser, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { playerId, teamId } = req.body;
    const { uid } = req.user;

    // Validate league is in draft mode
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    if (league.status !== 'draft') {
      return res.status(400).json({ error: 'League is not in draft mode' });
    }

    // Validate player exists and is not drafted
    const player = await Player.findOne({ _id: playerId, leagueId });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (player.draftedBy) {
      return res.status(400).json({ error: 'Player already drafted' });
    }

    // Validate team
    const team = await Team.findOne({ _id: teamId, leagueId });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Verify user is member of the team
    if (!team.members.includes(uid)) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    // Calculate whose turn it is
    const teams = await Team.find({ leagueId }).sort({ draftOrder: 1 });
    const totalDrafted = await Player.countDocuments({ leagueId, draftedBy: { $ne: null } });
    const currentPickTeamIndex = calculateSnakeDraftOrder(totalDrafted + 1, teams.length);
    const currentPickTeam = teams[currentPickTeamIndex];

    // Verify it's this team's turn
    if (currentPickTeam._id.toString() !== teamId) {
      return res.status(400).json({ error: 'It is not your turn to pick' });
    }

    // Make the pick
    player.draftedBy = teamId;
    await player.save();

    team.players.push(playerId);
    await team.save();

    res.json({
      message: 'Player drafted successfully',
      player,
      team,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/draft/reset - Reset draft
 */
router.post('/reset', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;

    // Reset all players
    await Player.updateMany(
      { leagueId },
      { $set: { draftedBy: null } }
    );

    // Reset all teams
    await Team.updateMany(
      { leagueId },
      { $set: { players: [], draftOrder: null } }
    );

    // Update league status
    await League.findByIdAndUpdate(leagueId, { status: 'setup', draftCompleted: false });

    res.json({ message: 'Draft reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/:leagueId/draft/status - Get draft status
 */
router.get('/status', async (req, res) => {
  try {
    const { leagueId } = req.params;

    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const teams = await Team.find({ leagueId })
      .populate('players', 'name photoUrl')
      .sort({ draftOrder: 1 });

    const totalPlayers = await Player.countDocuments({ leagueId });
    const draftedPlayers = await Player.countDocuments({ leagueId, draftedBy: { $ne: null } });

    let currentPickTeam = null;
    if (league.status === 'draft' && draftedPlayers < totalPlayers) {
      const currentPickIndex = calculateSnakeDraftOrder(draftedPlayers + 1, teams.length);
      currentPickTeam = teams[currentPickIndex];
    }

    res.json({
      status: league.status,
      totalPlayers,
      draftedPlayers,
      currentPickTeam,
      teams,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
