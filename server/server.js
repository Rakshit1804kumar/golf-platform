const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Stripe webhook needs raw body — must come BEFORE express.json()
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/scores',        require('./routes/scores'));
app.use('/api/draws',         require('./routes/draws'));
app.use('/api/charities',     require('./routes/charities'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/winners',       require('./routes/winners'));

// ── Health check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Connect DB + Start ──────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
