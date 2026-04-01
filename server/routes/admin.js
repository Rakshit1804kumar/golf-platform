const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const { Score, Draw, Winner, Charity } = require('../models/index');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// GET /api/admin/stats  — dashboard analytics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalDraws, pendingWinners, charities] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ subscriptionStatus: 'active' }),
      Draw.countDocuments({ status: 'published' }),
      Winner.countDocuments({ verificationStatus: 'pending' }),
      Charity.countDocuments(),
    ]);

    const wonAgg = await Winner.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$prizeAmount' } } },
    ]);
    const totalPaidOut = wonAgg[0]?.total || 0;

    const charityAgg = await User.aggregate([
      { $match: { subscriptionStatus: 'active' } },
      { $group: { _id: null, avgPct: { $avg: '$charityPct' } } },
    ]);
    const avgCharityPct = charityAgg[0]?.avgPct || 10;
    const monthlyRevenue = activeUsers * 9;
    const charityTotal = +(monthlyRevenue * (avgCharityPct / 100)).toFixed(2);

    res.json({ totalUsers, activeUsers, totalDraws, pendingWinners, charities,
               totalPaidOut, charityTotal, monthlyRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } },
                              { email: { $regex: search, $options: 'i' } }];
    if (status) query.subscriptionStatus = status;

    const users = await User.find(query)
      .select('-passwordHash')
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, subscriptionStatus, subscriptionPlan } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, subscriptionStatus, subscriptionPlan },
      { new: true }
    ).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Score.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users/:id/scores  — view/edit user scores
router.get('/users/:id/scores', async (req, res) => {
  try {
    const scores = await Score.find({ user: req.params.id }).sort({ playedAt: -1 });
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
