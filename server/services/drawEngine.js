const { Score, Draw, DrawEntry, Winner } = require('../models/index');
const User = require('../models/User');

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Draw type: Random ──────────────────────────────────────────
const runRandom = () => {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  return shuffle(pool).slice(0, 5);
};

// ── Draw type: Algorithmic (weighted by least frequent scores) ─
const runAlgorithmic = async () => {
  const scores = await Score.find({});
  const freq = {};
  scores.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1; });

  // Add any numbers not yet in scores with freq = 0
  for (let i = 1; i <= 45; i++) {
    if (!freq[i]) freq[i] = 0;
  }

  // Sort by frequency ascending (rarest = more likely drawn)
  const sorted = Object.entries(freq)
    .sort((a, b) => a[1] - b[1])
    .map(([num]) => Number(num));

  // Weighted sample from top rarest numbers
  return sorted.slice(0, 5);
};

// ── Prize pool calculation ─────────────────────────────────────
const calculatePools = async (rolloverAmount = 0) => {
  const activeCount = await User.countDocuments({ subscriptionStatus: 'active' });
  const monthlyPrice = 9.99;
  const yearlyMonthly = 7.99;
  const avgPrice = (monthlyPrice + yearlyMonthly) / 2;
  const totalPool = activeCount * avgPrice * 0.30; // 30% to prize pool

  return {
    jackpot:   +(totalPool * 0.40 + rolloverAmount).toFixed(2),
    pool4Match: +(totalPool * 0.35).toFixed(2),
    pool3Match: +(totalPool * 0.25).toFixed(2),
    activeCount,
  };
};

// ── Match checker ──────────────────────────────────────────────
const countMatches = (userScores, winningNumbers) => {
  const winSet = new Set(winningNumbers);
  return userScores.filter(s => winSet.has(s)).length;
};

// ── Run a draw ─────────────────────────────────────────────────
const executeDraw = async (drawId, simulate = false) => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found');

  const winningNumbers =
    draw.drawType === 'algorithmic' ? await runAlgorithmic() : runRandom();

  // Get all active subscribers
  const activeUsers = await User.find({ subscriptionStatus: 'active' });

  const entries = [];
  const winners = { '5-match': [], '4-match': [], '3-match': [] };

  for (const user of activeUsers) {
    const userScores = await Score.find({ user: user._id })
      .sort({ playedAt: -1 })
      .limit(5);
    const scoreNums = userScores.map(s => s.score);
    const matchCount = countMatches(scoreNums, winningNumbers);

    const entry = {
      draw: drawId,
      user: user._id,
      scoreSnapshot: scoreNums,
      matchCount,
      isWinner: matchCount >= 3,
    };
    entries.push(entry);

    if (matchCount === 5) winners['5-match'].push(user._id);
    else if (matchCount === 4) winners['4-match'].push(user._id);
    else if (matchCount === 3) winners['3-match'].push(user._id);
  }

  const pools = await calculatePools(draw.rolloverAmount || 0);

  if (!simulate) {
    // Save entries
    await DrawEntry.deleteMany({ draw: drawId });
    await DrawEntry.insertMany(entries);

    // Calculate individual prize amounts
    const jackpotHasWinner = winners['5-match'].length > 0;
    const jackpotPerWinner  = jackpotHasWinner ? +(pools.jackpot   / winners['5-match'].length).toFixed(2) : 0;
    const prize4PerWinner   = winners['4-match'].length > 0 ? +(pools.pool4Match / winners['4-match'].length).toFixed(2) : 0;
    const prize3PerWinner   = winners['3-match'].length > 0 ? +(pools.pool3Match / winners['3-match'].length).toFixed(2) : 0;

    // Save winners
    await Winner.deleteMany({ draw: drawId });
    const winnerDocs = [
      ...winners['5-match'].map(uid => ({ draw: drawId, user: uid, matchType: '5-match', prizeAmount: jackpotPerWinner })),
      ...winners['4-match'].map(uid => ({ draw: drawId, user: uid, matchType: '4-match', prizeAmount: prize4PerWinner })),
      ...winners['3-match'].map(uid => ({ draw: drawId, user: uid, matchType: '3-match', prizeAmount: prize3PerWinner })),
    ];
    if (winnerDocs.length) await Winner.insertMany(winnerDocs);

    // Update draw document
    draw.winningNumbers = winningNumbers;
    draw.jackpotAmount  = pools.jackpot;
    draw.pool4Match     = pools.pool4Match;
    draw.pool3Match     = pools.pool3Match;
    draw.totalEntries   = activeUsers.length;
    draw.jackpotRolledOver = !jackpotHasWinner;
    draw.rolloverAmount = jackpotHasWinner ? 0 : pools.jackpot;
    draw.status = 'published';
    await draw.save();
  }

  return {
    winningNumbers,
    pools,
    winners,
    totalEntries: activeUsers.length,
    simulate,
  };
};

module.exports = { executeDraw, runRandom, runAlgorithmic, calculatePools };
