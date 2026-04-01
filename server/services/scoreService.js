// ── services/scoreService.js ──────────────────────────────────
const { Score } = require('../models/index');

const addScore = async (userId, score, playedAt) => {
  // Get existing scores sorted oldest first
  const existing = await Score.find({ user: userId }).sort({ playedAt: 1, createdAt: 1 });

  if (existing.length >= 5) {
    await Score.findByIdAndDelete(existing[0]._id);
  }

  return await Score.create({ user: userId, score, playedAt });
};

const getUserScores = async (userId) =>
  Score.find({ user: userId }).sort({ playedAt: -1 }).limit(5);

module.exports = { addScore, getUserScores };
