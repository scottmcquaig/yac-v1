import mongoose from 'mongoose';

const leagueSchema = new mongoose.Schema({
  leagueName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerUid: {
    type: String,
    required: true,
  },
  admins: [{
    type: String,
    required: true,
  }],
  settings: {
    show: {
      type: String,
      required: true,
    },
    seasonLabel: {
      type: String,
      required: true,
    },
    maxTeams: {
      type: Number,
      default: 8,
      min: 2,
      max: 20,
    },
    membersPerTeam: {
      type: Number,
      default: 2,
      min: 1,
      max: 10,
    },
    draft: {
      type: {
        type: String,
        enum: ['snake'],
        default: 'snake',
      },
      pickSeconds: {
        type: Number,
        default: 60,
        min: 30,
        max: 600,
      },
      randomizedOrder: {
        type: Boolean,
        default: true,
      },
    },
    invites: {
      allowTeamInvites: {
        type: Boolean,
        default: true,
      },
      allowLeagueInvites: {
        type: Boolean,
        default: true,
      },
    },
    scoringRules: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  draftCompleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['setup', 'draft', 'active', 'final'],
    default: 'setup',
  },
}, {
  timestamps: true,
});

// Index for finding leagues by user
leagueSchema.index({ ownerUid: 1 });
leagueSchema.index({ admins: 1 });

export default mongoose.model('League', leagueSchema);
