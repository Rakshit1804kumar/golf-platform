/**
 * Seed script — run once to populate dev data
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const { Charity, Draw } = require('./models/index');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Charity.deleteMany({}), Draw.deleteMany({})]);
  console.log('Cleared existing data');

  // ── Charities ──────────────────────────────────────────────
  const charities = await Charity.insertMany([
  {
    name: 'Cancer Research UK',
    description: 'The world\'s leading cancer charity, dedicated to saving lives through research. Every pound we raise accelerates progress against cancer.',
    isFeatured: true,
    website: 'https://www.cancerresearchuk.org',
    totalRaised: 4820.50,
    imageUrl: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&w=400&h=250&fit=crop',
    upcomingEvents: [{ title: 'Charity Golf Day 2026', date: new Date('2026-06-15'), description: 'Annual golf day fundraiser at Wentworth.' }],
  },
  {
    name: "Alzheimer's Society",
    description: 'United against dementia. We provide support for people affected by dementia, fund research to find a cure, and campaign for change.',
    isFeatured: true,
    website: 'https://www.alzheimers.org.uk',
    totalRaised: 3210.00,
    imageUrl: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&w=400&h=250&fit=crop',
  },
  {
    name: 'British Heart Foundation',
    description: 'We fund research into heart and circulatory diseases, and help people understand and reduce their risk.',
    isFeatured: true,
    website: 'https://www.bhf.org.uk',
    totalRaised: 2980.75,
    imageUrl: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&w=400&h=250&fit=crop',
  },
  {
    name: 'Age UK',
    description: 'We work to improve the lives of older people in the UK, providing vital services, support and advocacy.',
    isFeatured: false,
    website: 'https://www.ageuk.org.uk',
    totalRaised: 1540.00,
    imageUrl: 'https://images.pexels.com/photos/3791664/pexels-photo-3791664.jpeg?auto=compress&w=400&h=250&fit=crop',
  },
  {
    name: 'Macmillan Cancer Support',
    description: 'We provide physical, financial and emotional support to help people with cancer live life as fully as they can.',
    isFeatured: false,
    website: 'https://www.macmillan.org.uk',
    totalRaised: 2100.25,
    imageUrl: 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&w=400&h=250&fit=crop',
  },
]);
  console.log(`✅ Created ${charities.length} charities`);

  // ── Admin user ─────────────────────────────────────────────
  const adminUser = await User.create({
    name:             'Admin User',
    email:            'admin@golfgives.com',
    passwordHash:     'admin123',
    role:             'admin',
    subscriptionStatus: 'active',
    subscriptionPlan: 'yearly',
    selectedCharity:  charities[0]._id,
    charityPct:       15,
    renewalDate:      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  // ── Test subscribers ───────────────────────────────────────
  const testUsers = await User.insertMany([
    {
      name: 'John Smith',
      email: 'john@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionStatus: 'active',
      subscriptionPlan: 'monthly',
      selectedCharity: charities[0]._id,
      charityPct: 10,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Sarah Jones',
      email: 'sarah@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionStatus: 'active',
      subscriptionPlan: 'yearly',
      selectedCharity: charities[1]._id,
      charityPct: 20,
      renewalDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Mike Wilson',
      email: 'mike@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionStatus: 'inactive',
      selectedCharity: charities[2]._id,
    },
  ]);
  console.log(`✅ Created ${testUsers.length + 1} users`);

  // ── Sample scores for active users ────────────────────────
  const { Score } = require('./models/index');
  const scoreData = [];
  for (const user of [testUsers[0], testUsers[1]]) {
    for (let i = 0; i < 5; i++) {
      scoreData.push({
        user: user._id,
        score: Math.floor(Math.random() * 30) + 15, // 15–44
        playedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      });
    }
  }
  await Score.insertMany(scoreData);
  console.log(`✅ Created ${scoreData.length} scores`);

  // ── Sample past draw ───────────────────────────────────────
  await Draw.create({
    month: new Date('2026-03-01'),
    status: 'published',
    drawType: 'random',
    winningNumbers: [12, 18, 27, 33, 41],
    jackpotAmount: 1200.00,
    pool4Match: 1050.00,
    pool3Match: 750.00,
    totalEntries: 142,
    jackpotRolledOver: false,
  });
  console.log('✅ Created 1 sample draw');

  console.log('\n🎉 Seed complete!\n');
  console.log('Admin login:  admin@golfgives.com  /  admin123');
  console.log('User login:   john@example.com     /  password123');
  console.log('User login:   sarah@example.com    /  password123\n');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
