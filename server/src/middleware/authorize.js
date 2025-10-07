import League from '../models/League.js';

/**
 * Middleware to verify user is an admin of the specified league
 */
export const requireLeagueAdmin = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const { uid } = req.user;

    if (!leagueId) {
      return res.status(400).json({ error: 'League ID required' });
    }

    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Check if user is owner or in admins array
    if (league.ownerUid !== uid && !league.admins.includes(uid)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach league to request for reuse
    req.league = league;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization failed' });
  }
};
