import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = { active: 'badge-green', inactive: 'badge-red', cancelled: 'badge-gray', past_due: 'badge-red' };
  return <span className={map[status] || 'badge-gray'}>{status}</span>;
};

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [scores,  setScores]  = useState([]);
  const [wins,    setWins]    = useState([]);
  const [entries, setEntries] = useState([]);
  const [pool,    setPool]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/scores'),
      api.get('/winners/my'),
      api.get('/draws/my-entries'),
      api.get('/draws/pool').catch(() => ({ data: null })),
    ]).then(([s, w, e, p]) => {
      setScores(s.data);
      setWins(w.data);
      setEntries(e.data);
      setPool(p.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePortal = async () => {
    try {
      const { data } = await api.post('/subscriptions/portal');
      window.location.href = data.url;
    } catch {
      toast.error('Could not open billing portal');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-gold text-lg animate-pulse">Loading dashboard…</div>
    </div>
  );

  const isSubscribed = user?.subscriptionStatus === 'active';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-white mb-1">
          Hello, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-white/50">Here's your GolfGives overview</p>
      </div>

      {/* Subscription banner if not subscribed */}
      {!isSubscribed && (
        <div className="mb-8 p-6 rounded-xl border border-gold/40 bg-gold/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-white font-semibold mb-1">You don't have an active subscription</div>
            <div className="text-white/50 text-sm">Subscribe to enter draws, log scores and donate to charity.</div>
          </div>
          <Link to="/subscribe" className="btn-gold shrink-0">Subscribe now →</Link>
        </div>
      )}

      {/* 4-card stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Subscription', value: <StatusBadge status={user?.subscriptionStatus} />, sub: user?.renewalDate ? `Renews ${new Date(user.renewalDate).toLocaleDateString('en-GB')}` : 'No active plan' },
          { label: 'Plan', value: user?.subscriptionPlan ? (user.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly') : '—', sub: 'Current plan' },
          { label: 'Scores logged', value: scores.length, sub: 'out of 5 max' },
          { label: 'Total won', value: `£${(user?.totalWon || 0).toFixed(2)}`, sub: 'All time winnings' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card">
            <div className="text-white/50 text-xs mb-2">{label}</div>
            <div className="text-white font-semibold text-lg">{value}</div>
            <div className="text-white/30 text-xs mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left col — scores + charity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Scores */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-semibold text-lg">My scores</h2>
              {isSubscribed && <Link to="/scores" className="btn-outline text-xs py-1.5 px-3">Manage →</Link>}
            </div>
            {scores.length === 0 ? (
              <div className="text-center py-8 text-white/30">
                <div className="text-4xl mb-2">⛳</div>
                <div className="text-sm">No scores yet. {isSubscribed ? <Link to="/scores" className="text-gold">Add your first score →</Link> : 'Subscribe to start logging.'}</div>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between p-3 rounded-lg bg-navy">
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-xs w-4">{i + 1}</span>
                      <div>
                        <div className="text-white font-semibold">{s.score} pts</div>
                        <div className="text-white/40 text-xs">{new Date(s.playedAt).toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <span className="text-gold font-bold text-sm">{s.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Draw entries */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-semibold text-lg">Draw history</h2>
              <Link to="/draws" className="btn-outline text-xs py-1.5 px-3">View all →</Link>
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-white/30 text-sm">No draw entries yet.</div>
            ) : (
              <div className="space-y-2">
                {entries.slice(0, 3).map(e => (
                  <div key={e._id} className="flex items-center justify-between p-3 rounded-lg bg-navy">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {new Date(e.draw?.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-white/40 text-xs">
                        Scores: [{e.scoreSnapshot?.join(', ')}]
                      </div>
                    </div>
                    <div>
                      {e.isWinner
                        ? <span className="badge-gold">Winner 🏆</span>
                        : <span className="badge-gray">{e.matchCount} match{e.matchCount !== 1 ? 'es' : ''}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — charity + prizes + billing */}
        <div className="space-y-6">

          {/* Charity */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">My charity</h2>
            {user?.selectedCharity ? (
              <div>
                <div className="text-white font-medium">{user.selectedCharity.name}</div>
                <div className="text-white/40 text-sm mt-1">Contributing {user.charityPct}% of subscription</div>
              </div>
            ) : (
              <div className="text-white/40 text-sm">No charity selected yet.</div>
            )}
            <Link to="/charities" className="btn-outline w-full justify-center mt-4 text-sm">
              {user?.selectedCharity ? 'Change charity' : 'Choose charity →'}
            </Link>
          </div>

          {/* Prize pool */}
          {pool && (
            <div className="card border-gold/20">
              <h2 className="text-white font-semibold mb-4">This month's pool</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Jackpot (5-match)</span>
                  <span className="text-gold font-semibold">£{pool.jackpot?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">4-match prize</span>
                  <span className="text-white">£{pool.pool4Match?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">3-match prize</span>
                  <span className="text-white">£{pool.pool3Match?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                  <span className="text-white/50">Active players</span>
                  <span className="text-white">{pool.activeCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Wins */}
          {wins.length > 0 && (
            <div className="card">
              <h2 className="text-white font-semibold mb-4">My winnings</h2>
              {wins.map(w => (
                <div key={w._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-sm">{w.matchType}</div>
                    <div className="text-white/40 text-xs">{new Date(w.draw?.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold font-semibold">£{w.prizeAmount?.toFixed(2)}</div>
                    <span className={w.paymentStatus === 'paid' ? 'badge-green' : 'badge-gray'}>{w.paymentStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Billing */}
          {isSubscribed && (
            <button onClick={handlePortal} className="btn-outline w-full justify-center text-sm">
              Manage billing →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
