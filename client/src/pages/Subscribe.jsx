import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '£9.99',
    period: '/month',
    features: ['Monthly draw entry', 'Score tracking', 'Charity contribution', 'Full dashboard access'],
    badge: null,
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '£95.88',
    period: '/year',
    perMonth: '£7.99/mo',
    features: ['Everything in Monthly', '2 months FREE', 'Priority winner verification', 'Charity impact report'],
    badge: 'Best value',
  },
];

export default function Subscribe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading]   = useState(false);

  const handleSubscribe = async () => {
    if (!user) { navigate('/signup'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions/create-checkout', { plan: selected });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Choose your plan</h1>
          <p className="text-white/50">Unlock the full GolfGives experience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`card text-left transition-all duration-200 border-2 ${
                selected === plan.id ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-white font-semibold">{plan.label}</div>
                  {plan.badge && <span className="badge-gold mt-1">{plan.badge}</span>}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === plan.id ? 'border-gold bg-gold' : 'border-white/30'
                }`}>
                  {selected === plan.id && <div className="w-2 h-2 bg-navy rounded-full" />}
                </div>
              </div>
              <div className="mb-4">
                <span className="font-display text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-white/40 text-sm">{plan.period}</span>
                {plan.perMonth && <div className="text-gold text-sm mt-1">{plan.perMonth}</div>}
              </div>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="text-gold text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="card border-gold/20 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎗️</span>
            <div>
              <div className="text-white font-medium text-sm">Charity contribution included</div>
              <div className="text-white/40 text-xs">At least 10% of your subscription goes directly to your chosen charity. You can increase this at any time.</div>
            </div>
          </div>
        </div>

        <button onClick={handleSubscribe} disabled={loading} className="btn-gold w-full justify-center py-4 text-base animate-pulse-gold">
          {loading ? 'Redirecting to checkout…' : `Subscribe — ${PLANS.find(p => p.id === selected)?.price} →`}
        </button>
        <p className="text-center text-white/30 text-xs mt-4">Secure payment via Stripe. Cancel anytime.</p>
      </div>
    </div>
  );
}
