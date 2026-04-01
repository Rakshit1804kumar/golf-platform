import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STEPS = [
  { num: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. Cancel anytime.' },
  { num: '02', title: 'Enter scores', desc: 'Log your last 5 Stableford scores after each round.' },
  { num: '03', title: 'Win prizes', desc: 'Your scores enter the monthly draw automatically.' },
  { num: '04', title: 'Give back', desc: 'A portion of every subscription goes straight to charity.' },
];

const STATS = [
  { value: '£48,200', label: 'Donated to charities' },
  { value: '1,240+', label: 'Active golfers' },
  { value: '£12,500', label: 'Prize pool this month' },
  { value: '34', label: 'Supported charities' },
];

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/charities?featured=true').then(r => setFeatured(r.data.slice(0, 3))).catch(() => { });
  }, []);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span className="text-gold text-sm font-medium">Monthly draw now open</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Play golf.<br />
              <span className="text-gold-shimmer">Win prizes.</span><br />
              Change lives.
            </h1>
            <p className="text-white/60 text-xl max-w-xl mb-10 leading-relaxed">
              The first golf subscription platform where every score you enter supports a charity you believe in — and gives you a shot at winning big.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-gold text-base py-4 px-8">Go to Dashboard →</Link>
              ) : (
                <>
                  <Link to="/signup" className="btn-gold text-base py-4 px-8 animate-pulse-gold">Start for £9.99/mo →</Link>
                  <Link to="/charities" className="btn-outline text-base py-4 px-8">Explore Charities</Link>
                </>
              )}
            </div>

            <p className="mt-6 text-white/30 text-sm">No commitment. Cancel anytime. 10% of every subscription goes to charity.</p>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ───────────────────────────────────────── */}
      <section className="bg-slate border-y border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-gold-shimmer font-display text-4xl font-bold mb-1">{value}</div>
                <div className="text-white/50 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">How it works</h2>
            <p className="section-sub mx-auto">Simple, transparent, and built around your game.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="card-hover group">
                <div className="text-gold/30 font-display text-6xl font-bold mb-4 group-hover:text-gold/50 transition-colors">{num}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE POOL ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title mb-4">Monthly prize draw</h2>
              <p className="text-white/60 mb-8 leading-relaxed">
                Every month we draw 5 numbers from the Stableford range. Match them against your logged scores to win. The more you match, the more you win.
              </p>
              <div className="space-y-4">
                {[
                  { match: '5 numbers', pct: '40%', label: 'Jackpot — rolls over if unclaimed', color: 'gold' },
                  { match: '4 numbers', pct: '35%', label: 'Major prize', color: 'white' },
                  { match: '3 numbers', pct: '25%', label: 'Reward prize', color: 'white' },
                ].map(({ match, pct, label, color }) => (
                  <div key={match} className="flex items-center gap-4 p-4 rounded-lg bg-navy border border-white/10">
                    <div className={`font-display text-2xl font-bold ${color === 'gold' ? 'text-gold' : 'text-white'}`}>{pct}</div>
                    <div>
                      <div className="text-white font-medium text-sm">Match {match}</div>
                      <div className="text-white/40 text-xs">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card border-gold/20 text-center py-12">
              <div className="text-white/40 text-sm mb-2">Current jackpot</div>
              <div className="text-gold-shimmer font-display text-6xl font-bold mb-2">£12,500</div>
              <div className="text-white/40 text-sm mb-8">+ rollovers from last month</div>
              <Link to={user ? '/draws' : '/signup'} className="btn-gold">
                {user ? 'View draw history' : 'Enter this month\'s draw →'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED CHARITIES ─────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Charities we support</h2>
              <p className="section-sub">You choose where your contribution goes.</p>
            </div>
            <Link to="/charities" className="btn-outline hidden sm:flex">View all →</Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featured.map(c => (
                <div key={c._id} className="card-hover">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                  ) : (
                    <div className="w-full h-40 rounded-lg mb-4 bg-navy flex items-center justify-center text-4xl">🏆</div>
                  )}
                  <div className="badge-gold mb-2">Featured</div>
                  <h3 className="text-white font-semibold text-lg mt-2">{c.name}</h3>
                  <p className="text-white/50 text-sm mt-1 line-clamp-2">{c.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { name: 'Cancer Research UK', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Cancer_Research_UK.svg/320px-Cancer_Research_UK.svg.png' },
                { name: "Alzheimer's Society", img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Alzheimer%27s_Society.svg/320px-Alzheimer%27s_Society.svg.png' },
                { name: 'British Heart Foundation', img: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/British_Heart_Foundation_logo.svg/320px-British_Heart_Foundation_logo.svg.png' },
              ].map(({ name, img }) => (
                <div key={name} className="card-hover">
                  <img
                    src={img}
                    alt={name}
                    className="w-full h-40 object-contain rounded-lg mb-4 bg-white/5 p-4"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="badge-gold mb-2">Featured</div>
                  <h3 className="text-white font-semibold text-lg mt-2">{name}</h3>
                  <p className="text-white/50 text-sm mt-1">Making a real difference with every subscription.</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/charities" className="btn-outline sm:hidden">View all charities →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Ready to play with purpose?</h2>
          <p className="text-white/60 text-lg mb-8">Join 1,240+ golfers already making an impact every month.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="btn-gold text-base py-4 px-8">Get started — £9.99/mo</Link>
            <Link to="/charities" className="btn-outline text-base py-4 px-8">Browse charities</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
