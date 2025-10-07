import mongoose from 'mongoose';

const scoringEventSchema = new mongoose.Schema({
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  week: {
    type: Number,
    required: true,
    min: 1,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  points: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
scoringEventSchema.index({ leagueId: 1, week: 1 });
scoringEventSchema.index({ player: 1 });

export default mongoose.model('ScoringEvent', scoringEventSchema);
