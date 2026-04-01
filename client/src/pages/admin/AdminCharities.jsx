import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', imageUrl: '', website: '', isFeatured: false };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(null); // null | 'new' | id
  const [form,      setForm]      = useState(EMPTY);

  const load = () =>
    api.get('/charities').then(r => setCharities(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openNew  = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', website: c.website || '', isFeatured: c.isFeatured }); setEditing(c._id); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await api.post('/charities', form);
        toast.success('Charity created');
      } else {
        await api.put(`/charities/${editing}`, form);
        toast.success('Charity updated');
      }
      setEditing(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity?')) return;
    try {
      await api.delete(`/charities/${id}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Charities</h1>
        <button onClick={openNew} className="btn-gold text-sm py-2">+ Add charity</button>
      </div>

      {/* Form */}
      {editing !== null && (
        <div className="card mb-6 border-gold/30">
          <h2 className="text-white font-semibold mb-4">{editing === 'new' ? 'New charity' : 'Edit charity'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" type="url" placeholder="https://" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input className="input" type="url" placeholder="https://…" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))}
                className="w-4 h-4 accent-yellow-500" />
              <label htmlFor="featured" className="text-white/70 text-sm">Featured on homepage</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-gold">Save charity →</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-gold animate-pulse">Loading…</div>
      ) : charities.length === 0 ? (
        <div className="text-center py-16 text-white/30">No charities yet.</div>
      ) : (
        <div className="space-y-3">
          {charities.map(c => (
            <div key={c._id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {c.imageUrl
                  ? <img src={c.imageUrl} alt={c.name} className="w-12 h-12 rounded-lg object-cover" />
                  : <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center text-2xl">🎗️</div>
                }
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{c.name}</span>
                    {c.isFeatured && <span className="badge-gold">Featured</span>}
                  </div>
                  <div className="text-white/40 text-sm line-clamp-1 max-w-xs">{c.description}</div>
                  <div className="text-white/30 text-xs mt-0.5">Total raised: £{(c.totalRaised || 0).toFixed(2)}</div>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => openEdit(c)} className="text-gold hover:underline text-xs">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:underline text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
