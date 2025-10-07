import express from 'express';
import Player from '../models/Player.js';
import League from '../models/League.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireLeagueAdmin } from '../middleware/authorize.js';
import { validatePlayerName } from '../lib/validation.js';

const router = express.Router();

/**
 * GET /api/leagues/:leagueId/players - Get all players
 */
router.get('/', async (req, res) => {
  try {
    const { leagueId } = req.params;

    const players = await Player.find({ leagueId })
      .populate('draftedBy', 'name')
      .sort({ name: 1 })
      .lean();

    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/leagues/:leagueId/players/import - Bulk import players
 */
router.post('/import', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { players } = req.body;

    if (!Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: 'Players array required' });
    }

    // Validate league exists
    const league = await League.findById(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Validate and sanitize player data
    const validatedPlayers = players.map(player => {
      if (!player.name) {
        throw new Error('Each player must have a name');
      }

      return {
        leagueId,
        name: validatePlayerName(player.name),
        photoUrl: player.photoUrl || '',
        meta: {
          tribe: player.tribe || player.meta?.tribe || '',
          status: player.status || player.meta?.status || 'active',
        },
      };
    });

    // Insert players
    const createdPlayers = await Player.insertMany(validatedPlayers);

    res.status(201).json({
      message: `${createdPlayers.length} players imported`,
      players: createdPlayers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/leagues/:leagueId/players/:playerId - Update player
 */
router.patch('/:playerId', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId, playerId } = req.params;
    const { name, photoUrl, meta } = req.body;

    const updateData = {};
    if (name) updateData.name = validatePlayerName(name);
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (meta) updateData.meta = meta;

    const player = await Player.findOneAndUpdate(
      { _id: playerId, leagueId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/leagues/:leagueId/players/:playerId - Delete player
 */
router.delete('/:playerId', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId, playerId } = req.params;

    const player = await Player.findOneAndDelete({ _id: playerId, leagueId });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
