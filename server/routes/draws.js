const router  = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { Draw, DrawEntry, Winner } = require('../models/index');
const { executeDraw, calculatePools } = require('../services/drawEngine');

// GET /api/draws  — published draws (public)
router.get('/', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' }).sort({ month: -1 }).limit(12);
    res.json(draws);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/draws/my-entries  — user's draw history
router.get('/my-entries', protect, async (req, res) => {
  try {
    const entries = await DrawEntry.find({ user: req.user._id })
      .populate('draw', 'month winningNumbers status jackpotAmount')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/draws/pool  — current prize pool estimate
router.get('/pool', protect, async (req, res) => {
  try {
    const pool = await calculatePools();
    res.json(pool);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin routes ───────────────────────────────────────────────

// GET /api/draws/admin/all
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const draws = await Draw.find().sort({ month: -1 });
    res.json(draws);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/draws/admin/create
router.post('/admin/create', protect, adminOnly, async (req, res) => {
  try {
    const { month, drawType } = req.body;
    const draw = await Draw.create({ month: new Date(month), drawType: drawType || 'random' });
    res.status(201).json(draw);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/draws/admin/:id/simulate
router.post('/admin/:id/simulate', protect, adminOnly, async (req, res) => {
  try {
    const result = await executeDraw(req.params.id, true);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/draws/admin/:id/publish
router.post('/admin/:id/publish', protect, adminOnly, async (req, res) => {
  try {
    const result = await executeDraw(req.params.id, false);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/draws/admin/:id
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    await Draw.findByIdAndDelete(req.params.id);
    await DrawEntry.deleteMany({ draw: req.params.id });
    res.json({ message: 'Draw deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
