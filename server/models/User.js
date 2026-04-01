const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:  { type: String, enum: ['user', 'admin'], default: 'user' },

    // Stripe
    stripeCustomerId:     { type: String },
    stripeSubscriptionId: { type: String },
    subscriptionStatus:   { type: String, enum: ['active', 'inactive', 'cancelled', 'past_due'], default: 'inactive' },
    subscriptionPlan:     { type: String, enum: ['monthly', 'yearly', null], default: null },
    renewalDate:          { type: Date },

    // Charity
    selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
    charityPct:      { type: Number, default: 10, min: 10, max: 100 },

    // Stats
    totalWon: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
