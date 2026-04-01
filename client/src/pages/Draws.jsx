// ── Draws.jsx ──────────────────────────────────────────────────
import { useEffect, useState } from 'react';
import api from '../api/axios';

export function Draws() {
  const [draws,   setDraws]   = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/draws'), api.get('/draws/my-entries')])
      .then(([d, e]) => { setDraws(d.data); setEntries(e.data); })
      .finally(() => setLoading(false));
  }, []);

  const getMyEntry = (drawId) => entries.find(e => e.draw?._id === drawId);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gold animate-pulse">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Draw history</h1>
        <p className="text-white/50">Monthly draw results and your participation</p>
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-3">🎰</div>
          <p>No draws published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => {
            const entry = getMyEntry(draw._id);
            return (
              <div key={draw._id} className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-white font-semibold text-lg">
                      {new Date(draw.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Draw
                    </h2>
                    <div className="text-white/40 text-sm mt-0.5">{draw.totalEntries} entries</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {entry ? (
                      entry.isWinner
                        ? <span className="badge-gold">You won! 🏆</span>
                        : <span className="badge-gray">{entry.matchCount} match{entry.matchCount !== 1 ? 'es' : ''}</span>
                    ) : (
                      <span className="badge-gray">Not entered</span>
                    )}
                    {draw.jackpotRolledOver && <span className="badge-red">Jackpot rolled over</span>}
                  </div>
                </div>

                <div>
                  <div className="text-white/40 text-xs mb-2">Winning numbers</div>
                  <div className="flex gap-2 flex-wrap">
                    {draw.winningNumbers?.map((n, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${
                        entry?.scoreSnapshot?.includes(n)
                          ? 'bg-gold text-navy border-gold'
                          : 'bg-navy border-white/20 text-white'
                      }`}>
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {entry?.scoreSnapshot?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-white/40 text-xs mb-2">Your scores at draw time</div>
                    <div className="flex gap-2 flex-wrap">
                      {entry.scoreSnapshot.map((n, i) => (
                        <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                          draw.winningNumbers?.includes(n) ? 'bg-gold/20 text-gold border border-gold/40' : 'bg-white/5 text-white/50'
                        }`}>
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[['Jackpot', draw.jackpotAmount], ['4-match pool', draw.pool4Match], ['3-match pool', draw.pool3Match]].map(([label, val]) => (
                    <div key={label} className="bg-navy rounded-lg p-2">
                      <div className="text-white font-semibold text-sm">£{Number(val || 0).toFixed(2)}</div>
                      <div className="text-white/30 text-xs">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Draws;
