const router = require('express').Router();
const { protect, subscriberOnly } = require('../middleware/auth');
const { Score } = require('../models/index');
const { addScore, getUserScores } = require('../services/scoreService');

// GET /api/scores  — my scores
router.get('/', protect, async (req, res) => {
  try {
    const scores = await getUserScores(req.user._id);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/scores  — add a score (subscribers only)
router.post('/', protect, subscriberOnly, async (req, res) => {
  try {
    const { score, playedAt } = req.body;
    if (!score || !playedAt)
      return res.status(400).json({ message: 'score and playedAt required' });
    if (score < 1 || score > 45)
      return res.status(400).json({ message: 'Score must be between 1 and 45' });

    const newScore = await addScore(req.user._id, score, new Date(playedAt));
    res.status(201).json(newScore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/scores/:id
router.delete('/:id', protect, subscriberOnly, async (req, res) => {
  try {
    const score = await Score.findOne({ _id: req.params.id, user: req.user._id });
    if (!score) return res.status(404).json({ message: 'Score not found' });
    await score.deleteOne();
    res.json({ message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
