import express from 'express';
import Invite from '../models/Invite.js';
import Team from '../models/Team.js';
import League from '../models/League.js';
import { authenticateUser } from '../middleware/auth.js';
import { requireLeagueAdmin } from '../middleware/authorize.js';
import { generateInviteCode } from '../lib/utils.js';
import { validateEnum, validateNumber, validateInviteCode } from '../lib/validation.js';

const router = express.Router();

/**
 * POST /api/leagues/:leagueId/invites - Create invite
 */
router.post('/', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { type, teamId, multiUse, maxUses, expiresAt } = req.body;
    const { uid } = req.user;

    const validType = validateEnum(type, ['league', 'team'], 'Invite type');

    // Validate team if type is 'team'
    if (validType === 'team') {
      if (!teamId) {
        return res.status(400).json({ error: 'Team ID required for team invites' });
      }

      const team = await Team.findOne({ _id: teamId, leagueId });
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
    }

    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateInviteCode();
      const existing = await Invite.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }

    const invite = await Invite.create({
      leagueId,
      type: validType,
      teamId: validType === 'team' ? teamId : null,
      code,
      multiUse: multiUse !== false,
      maxUses: maxUses ? validateNumber(maxUses, 1, 1000, 'Max uses') : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: uid,
    });

    res.status(201).json(invite);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/invites/redeem - Redeem invite code
 */
router.post('/redeem', authenticateUser, async (req, res) => {
  try {
    const { code, teamName } = req.body;
    const { uid } = req.user;

    const validCode = validateInviteCode(code);

    const invite = await Invite.findOne({ code: validCode });

    if (!invite) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check expiration
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Invite code expired' });
    }

    // Check usage limit
    if (!invite.multiUse && invite.uses >= 1) {
      return res.status(400).json({ error: 'Invite code already used' });
    }

    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return res.status(400).json({ error: 'Invite code usage limit reached' });
    }

    // Check if user already has a team in this league
    const existingTeam = await Team.findOne({ leagueId: invite.leagueId, members: uid });
    if (existingTeam) {
      return res.status(400).json({ error: 'You already belong to a team in this league' });
    }

    let team;

    if (invite.type === 'league') {
      // Create new team
      if (!teamName) {
        return res.status(400).json({ error: 'Team name required for league invites' });
      }

      const league = await League.findById(invite.leagueId);
      if (!league) {
        return res.status(404).json({ error: 'League not found' });
      }

      team = await Team.create({
        leagueId: invite.leagueId,
        name: teamName,
        members: [uid],
        maxMembers: league.settings.membersPerTeam,
      });
    } else {
      // Join existing team
      team = await Team.findById(invite.teamId);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({ error: 'Team is full' });
      }

      team.members.push(uid);
      await team.save();
    }

    // Increment usage
    invite.uses += 1;
    await invite.save();

    res.json({
      message: 'Invite redeemed successfully',
      team,
      league: invite.leagueId,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/leagues/:leagueId/invites - List invites
 */
router.get('/', authenticateUser, requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId } = req.params;

    const invites = await Invite.find({ leagueId })
      .populate('teamId', 'name')
      .sort({ createdAt: -1 });

    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
