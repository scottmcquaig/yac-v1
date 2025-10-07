import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'League',
    required: true,
  },
  type: {
    type: String,
    enum: ['league', 'team'],
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  multiUse: {
    type: Boolean,
    default: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
inviteSchema.index({ code: 1 });
inviteSchema.index({ leagueId: 1 });

export default mongoose.model('Invite', inviteSchema);
