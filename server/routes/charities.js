const router  = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { Charity } = require('../models/index');

// GET /api/charities
router.get('/', async (req, res) => {
  try {
    const { search, featured } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    const charities = await Charity.find(query).sort({ isFeatured: -1, name: 1 });
    res.json(charities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Not found' });
    res.json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/charities  — admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/charities/:id  — admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(charity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/charities/:id  — admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Charity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/charities/select/:id  — user selects charity
router.put('/select/:id', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const { charityPct } = req.body;
    const update = { selectedCharity: req.params.id };
    if (charityPct && charityPct >= 10) update.charityPct = charityPct;
    await User.findByIdAndUpdate(req.user._id, update);
    res.json({ message: 'Charity updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
