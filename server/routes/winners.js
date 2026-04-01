const router     = require('express').Router();
const multer     = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect, adminOnly } = require('../middleware/auth');
const { Winner } = require('../models/index');
const User       = require('../models/User');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload  = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// GET /api/winners/my  — user's wins
router.get('/my', protect, async (req, res) => {
  try {
    const wins = await Winner.find({ user: req.user._id })
      .populate('draw', 'month winningNumbers')
      .sort({ createdAt: -1 });
    res.json(wins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/winners/:id/proof  — upload proof
router.post('/:id/proof', protect, upload.single('proof'), async (req, res) => {
  try {
    const winner = await Winner.findOne({ _id: req.params.id, user: req.user._id });
    if (!winner) return res.status(404).json({ message: 'Winner record not found' });
    if (!req.file)  return res.status(400).json({ message: 'No file uploaded' });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'golf-charity/proofs', resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    winner.proofUrl = result.secure_url;
    winner.verificationStatus = 'pending';
    await winner.save();

    res.json({ message: 'Proof uploaded', proofUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin ──────────────────────────────────────────────────────

// GET /api/winners/admin/all
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const winners = await Winner.find()
      .populate('user', 'name email')
      .populate('draw', 'month winningNumbers')
      .sort({ createdAt: -1 });
    res.json(winners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/winners/admin/:id/verify
router.put('/admin/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body; // 'approved' | 'rejected'
    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status, adminNote },
      { new: true }
    ).populate('user', 'name email totalWon');

    if (status === 'approved') {
      await User.findByIdAndUpdate(winner.user._id, {
        $inc: { totalWon: winner.prizeAmount },
      });
    }

    res.json(winner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/winners/admin/:id/pay
router.put('/admin/:id/pay', protect, adminOnly, async (req, res) => {
  try {
    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid' },
      { new: true }
    );
    res.json(winner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
