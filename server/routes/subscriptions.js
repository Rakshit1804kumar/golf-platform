const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// POST /api/subscriptions/create-checkout
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' | 'yearly'
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    // Create or retrieve Stripe customer
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name:  req.user.name,
        metadata: { userId: req.user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=true`,
      cancel_url:  `${process.env.CLIENT_URL}/subscribe?cancelled=true`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscriptions/portal  — billing portal
router.post('/portal', protect, async (req, res) => {
  try {
    if (!req.user.stripeCustomerId)
      return res.status(400).json({ message: 'No subscription found' });

    const session = await stripe.billingPortal.sessions.create({
      customer:   req.user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscriptions/webhook  — Stripe events
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature verification failed');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId  = session.metadata?.userId;
        if (!userId) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const plan = subscription.items.data[0].price.id === process.env.STRIPE_YEARLY_PRICE_ID
          ? 'yearly' : 'monthly';

        await User.findByIdAndUpdate(userId, {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus:   'active',
          subscriptionPlan:     plan,
          renewalDate:          new Date(subscription.current_period_end * 1000),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        const user = await User.findOne({ stripeCustomerId: customer.id });
        if (user) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: 'active',
            renewalDate: new Date(sub.current_period_end * 1000),
          });
        }
        break;
      }

      case 'invoice.payment_failed':
      case 'customer.subscription.deleted': {
        const obj = event.data.object;
        const customerId = obj.customer || obj.id;
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          await User.findByIdAndUpdate(user._id, { subscriptionStatus: 'inactive' });
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  res.json({ received: true });
});

module.exports = router;
