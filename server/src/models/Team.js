import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  members: [{
    type: String, // Firebase UIDs
  }],
  maxMembers: {
    type: Number,
    default: 2,
    min: 1,
    max: 10,
  },
  draftOrder: {
    type: Number,
    default: null,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  weeklyPoints: {
    type: Map,
    of: Number,
    default: {},
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
  }],
}, {
  timestamps: true,
});

// Indexes
teamSchema.index({ leagueId: 1 });
teamSchema.index({ leagueId: 1, draftOrder: 1 });
teamSchema.index({ members: 1 });

export default mongoose.model('Team', teamSchema);
