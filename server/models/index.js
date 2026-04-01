const mongoose = require('mongoose');

// ── Score ──────────────────────────────────────────────────────
const ScoreSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score:    { type: Number, min: 1, max: 45, required: true },
    playedAt: { type: Date, required: true },
  },
  { timestamps: true }
);
ScoreSchema.index({ user: 1, playedAt: -1 });

// ── Charity ────────────────────────────────────────────────────
const CharitySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl:    { type: String },
    isFeatured:  { type: Boolean, default: false },
    website:     { type: String },
    upcomingEvents: [
      {
        title: String,
        date:  Date,
        description: String,
      },
    ],
    totalRaised: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Draw ───────────────────────────────────────────────────────
const DrawSchema = new mongoose.Schema(
  {
    month:          { type: Date, required: true },
    status:         { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },
    drawType:       { type: String, enum: ['random', 'algorithmic'], default: 'random' },
    winningNumbers: [Number],
    jackpotAmount:  { type: Number, default: 0 },
    pool4Match:     { type: Number, default: 0 },
    pool3Match:     { type: Number, default: 0 },
    jackpotRolledOver: { type: Boolean, default: false },
    rolloverAmount:    { type: Number, default: 0 },
    totalEntries:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── DrawEntry ──────────────────────────────────────────────────
const DrawEntrySchema = new mongoose.Schema(
  {
    draw:          { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scoreSnapshot: [Number],
    matchCount:    { type: Number, default: 0 },
    isWinner:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Winner ─────────────────────────────────────────────────────
const WinnerSchema = new mongoose.Schema(
  {
    draw:               { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
    user:               { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchType:          { type: String, enum: ['5-match', '4-match', '3-match'] },
    prizeAmount:        { type: Number },
    proofUrl:           { type: String },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    paymentStatus:      { type: String, enum: ['pending', 'paid'], default: 'pending' },
    adminNote:          { type: String },
  },
  { timestamps: true }
);

module.exports = {
  Score:     mongoose.model('Score',     ScoreSchema),
  Charity:   mongoose.model('Charity',   CharitySchema),
  Draw:      mongoose.model('Draw',      DrawSchema),
  DrawEntry: mongoose.model('DrawEntry', DrawEntrySchema),
  Winner:    mongoose.model('Winner',    WinnerSchema),
};
