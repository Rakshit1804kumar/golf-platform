import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Scores() {
  const { user } = useAuth();
  const [scores,  setScores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ score: '', playedAt: '' });
  const [adding,  setAdding]  = useState(false);

  const load = () => api.get('/scores').then(r => setScores(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  if (user?.subscriptionStatus !== 'active') return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">⛳</div>
      <h2 className="font-display text-2xl text-white mb-3">Subscription required</h2>
      <p className="text-white/50 mb-6">You need an active subscription to log golf scores.</p>
      <Link to="/subscribe" className="btn-gold">Subscribe now →</Link>
    </div>
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    const scoreNum = parseInt(form.score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45)
      return toast.error('Score must be between 1 and 45');
    if (!form.playedAt) return toast.error('Please enter the date played');

    setAdding(true);
    try {
      await api.post('/scores', { score: scoreNum, playedAt: form.playedAt });
      toast.success('Score added!');
      setForm({ score: '', playedAt: '' });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add score');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score removed');
      setScores(s => s.filter(x => x._id !== id));
    } catch {
      toast.error('Failed to delete score');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-1">My scores</h1>
        <p className="text-white/50 text-sm">Keep your 5 most recent Stableford scores. A new score automatically replaces the oldest.</p>
      </div>

      {/* Score counter */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < scores.length ? 'bg-gold' : 'bg-white/10'}`} />
        ))}
      </div>
      <p className="text-white/40 text-xs mb-8">{scores.length}/5 scores logged {scores.length === 5 && '— adding a new score will remove the oldest'}</p>

      {/* Add form */}
      <div className="card mb-8">
        <h2 className="text-white font-semibold mb-4">Add a score</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Stableford score</label>
            <input className="input" type="number" min="1" max="45" placeholder="e.g. 34"
              value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} required />
            <p className="text-white/30 text-xs mt-1">Between 1 and 45</p>
          </div>
          <div>
            <label className="label">Date played</label>
            <input className="input" type="date" max={new Date().toISOString().split('T')[0]}
              value={form.playedAt} onChange={e => setForm(p => ({ ...p, playedAt: e.target.value }))} required />
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={adding} className="btn-gold w-full justify-center">
              {adding ? 'Adding…' : 'Add score →'}
            </button>
          </div>
        </form>
      </div>

      {/* Score list */}
      {loading ? (
        <div className="text-center py-8 text-white/30 animate-pulse">Loading…</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <div className="text-5xl mb-3">⛳</div>
          <p>No scores yet. Add your first round above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-white font-semibold mb-2">Logged scores</h2>
          {scores.map((s, i) => (
            <div key={s._id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white/30 text-sm w-4">{i + 1}</span>
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold font-bold text-lg">{s.score}</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{s.score} Stableford points</div>
                  <div className="text-white/40 text-sm">{new Date(s.playedAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(s._id)} className="text-white/20 hover:text-red-400 transition-colors text-sm p-2">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
