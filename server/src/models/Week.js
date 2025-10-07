import mongoose from 'mongoose';

const weekSchema = new mongoose.Schema({
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  weekNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  episodeDate: {
    type: Date,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  scoringFinalized: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
weekSchema.index({ leagueId: 1, weekNumber: 1 }, { unique: true });

export default mongoose.model('Week', weekSchema);
