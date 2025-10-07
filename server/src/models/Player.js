import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
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
  photoUrl: {
    type: String,
    default: '',
  },
  meta: {
    tribe: String,
    status: {
      type: String,
      enum: ['active', 'voted_out', 'jury', 'finalist', 'winner'],
      default: 'active',
    },
  },
  draftedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
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
}, {
  timestamps: true,
});

// Indexes
playerSchema.index({ leagueId: 1 });
playerSchema.index({ leagueId: 1, draftedBy: 1 });

export default mongoose.model('Player', playerSchema);
