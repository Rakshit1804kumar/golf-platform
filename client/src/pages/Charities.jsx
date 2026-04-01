import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Charities() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);

  const load = (q = '') =>
    api.get(`/charities${q ? `?search=${q}` : ''}`)
      .then(r => setCharities(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSelect = async (charityId) => {
    if (!user) return toast.error('Please login first');
    if (user.subscriptionStatus !== 'active') return toast.error('Active subscription required');
    setSelecting(charityId);
    try {
      await api.put(`/charities/select/${charityId}`, { charityPct: 10 });
      await refreshUser();
      toast.success('Charity updated!');
    } catch {
      toast.error('Failed to update charity');
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-white mb-3">Supported charities</h1>
        <p className="text-white/50 max-w-xl">Every GolfGives subscription contributes to charity. Choose the cause that means the most to you.</p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-md">
        <input
          className="input"
          type="text"
          placeholder="Search charities…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gold animate-pulse">Loading charities…</div>
      ) : charities.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <div className="text-5xl mb-3">🔍</div>
          <p>No charities found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map(c => {
            const isSelected = user?.selectedCharity?._id === c._id || user?.selectedCharity === c._id;
            return (
              <div key={c._id} className={`card-hover flex flex-col ${isSelected ? 'border-gold' : ''}`}>
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div
                  className="w-full h-40 rounded-lg mb-4 bg-gradient-to-br from-gold/20 to-navy flex items-center justify-center"
                  style={{ display: c.imageUrl ? 'none' : 'flex' }}
                >
                  <span className="font-display text-4xl font-bold text-gold/60">
                    {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>

                <div className="flex-1">
                  {c.isFeatured && <span className="badge-gold mb-2">Featured</span>}
                  <h3 className="text-white font-semibold text-lg mt-2">{c.name}</h3>
                  {c.description && <p className="text-white/50 text-sm mt-2 leading-relaxed line-clamp-3">{c.description}</p>}

                  {c.totalRaised > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-gold font-semibold">£{c.totalRaised.toFixed(2)}</span>
                      <span className="text-white/40"> raised so far</span>
                    </div>
                  )}

                  {c.upcomingEvents?.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-navy border border-white/10">
                      <div className="text-white/40 text-xs mb-1">Upcoming event</div>
                      <div className="text-white text-sm font-medium">{c.upcomingEvents[0].title}</div>
                      <div className="text-white/40 text-xs">{new Date(c.upcomingEvents[0].date).toLocaleDateString('en-GB')}</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleSelect(c._id)}
                  disabled={selecting === c._id || isSelected}
                  className={`mt-4 w-full justify-center py-2 text-sm ${isSelected ? 'btn-gold opacity-80 cursor-default' : 'btn-outline'}`}
                >
                  {isSelected ? '✓ Your charity' : selecting === c._id ? 'Selecting…' : 'Choose this charity →'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
