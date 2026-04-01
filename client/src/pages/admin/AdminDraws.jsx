import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminDraws() {
  const [draws,     setDraws]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [simResult, setSimResult] = useState(null);
  const [creating,  setCreating]  = useState(false);
  const [newDraw,   setNewDraw]   = useState({ month: '', drawType: 'random' });

  const load = () =>
    api.get('/draws/admin/all').then(r => setDraws(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/draws/admin/create', newDraw);
      toast.success('Draw created');
      setCreating(false);
      setNewDraw({ month: '', drawType: 'random' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create draw'); }
  };

  const handleSimulate = async (id) => {
    try {
      const { data } = await api.post(`/draws/admin/${id}/simulate`);
      setSimResult({ drawId: id, ...data });
      toast.success('Simulation complete');
    } catch { toast.error('Simulation failed'); }
  };

  const handlePublish = async (id) => {
    if (!confirm('Publish this draw? This cannot be undone.')) return;
    try {
      await api.post(`/draws/admin/${id}/publish`);
      toast.success('Draw published!');
      setSimResult(null);
      load();
    } catch { toast.error('Publish failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this draw?')) return;
    try {
      await api.delete(`/draws/admin/${id}`);
      toast.success('Draw deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const statusColor = { pending: 'badge-gray', simulated: 'badge-gold', published: 'badge-green' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Draw management</h1>
        <button onClick={() => setCreating(c => !c)} className="btn-gold text-sm py-2">
          {creating ? 'Cancel' : '+ New draw'}
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="card mb-6 border-gold/30">
          <h2 className="text-white font-semibold mb-4">Create new draw</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">Draw month</label>
              <input className="input" type="month" value={newDraw.month}
                onChange={e => setNewDraw(p => ({ ...p, month: e.target.value + '-01' }))} required />
            </div>
            <div>
              <label className="label">Draw type</label>
              <select className="input" value={newDraw.drawType}
                onChange={e => setNewDraw(p => ({ ...p, drawType: e.target.value }))}>
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
            <button type="submit" className="btn-gold">Create →</button>
          </form>
        </div>
      )}

      {/* Simulation result */}
      {simResult && (
        <div className="card mb-6 border-gold/40 bg-gold/5">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-white font-semibold">Simulation result (not published)</h2>
            <button onClick={() => setSimResult(null)} className="text-white/40 hover:text-white text-sm">✕</button>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {simResult.winningNumbers?.map((n, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gold text-navy font-bold text-sm flex items-center justify-center">{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-navy rounded-lg p-3">
              <div className="text-gold font-bold">£{simResult.pools?.jackpot?.toFixed(2)}</div>
              <div className="text-white/40 text-xs">Jackpot pool</div>
              <div className="text-white text-xs mt-1">{simResult.winners?.['5-match']?.length || 0} winner(s)</div>
            </div>
            <div className="bg-navy rounded-lg p-3">
              <div className="text-white font-bold">£{simResult.pools?.pool4Match?.toFixed(2)}</div>
              <div className="text-white/40 text-xs">4-match pool</div>
              <div className="text-white text-xs mt-1">{simResult.winners?.['4-match']?.length || 0} winner(s)</div>
            </div>
            <div className="bg-navy rounded-lg p-3">
              <div className="text-white font-bold">£{simResult.pools?.pool3Match?.toFixed(2)}</div>
              <div className="text-white/40 text-xs">3-match pool</div>
              <div className="text-white text-xs mt-1">{simResult.winners?.['3-match']?.length || 0} winner(s)</div>
            </div>
          </div>
          <div className="text-white/40 text-xs mb-4">Total entries: {simResult.totalEntries}</div>
          <button onClick={() => handlePublish(simResult.drawId)} className="btn-gold text-sm">
            Publish this draw →
          </button>
        </div>
      )}

      {/* Draw list */}
      {loading ? (
        <div className="text-gold animate-pulse">Loading…</div>
      ) : draws.length === 0 ? (
        <div className="text-center py-16 text-white/30">No draws yet. Create one above.</div>
      ) : (
        <div className="space-y-3">
          {draws.map(d => (
            <div key={d._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold">
                      {new Date(d.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </h3>
                    <span className={statusColor[d.status]}>{d.status}</span>
                    <span className="badge-gray">{d.drawType}</span>
                  </div>
                  {d.winningNumbers?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {d.winningNumbers.map((n, i) => (
                        <span key={i} className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-bold flex items-center justify-center">{n}</span>
                      ))}
                    </div>
                  )}
                  <div className="text-white/30 text-xs mt-2">
                    Entries: {d.totalEntries} · Jackpot: £{(d.jackpotAmount || 0).toFixed(2)}
                    {d.jackpotRolledOver && ' · 🔄 Rolled over'}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {d.status === 'pending' && (
                    <>
                      <button onClick={() => handleSimulate(d._id)} className="btn-outline text-xs py-1.5 px-3">Simulate</button>
                      <button onClick={() => handlePublish(d._id)} className="btn-gold text-xs py-1.5 px-3">Publish →</button>
                    </>
                  )}
                  {d.status !== 'published' && (
                    <button onClick={() => handleDelete(d._id)} className="text-red-400 hover:underline text-xs">Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
