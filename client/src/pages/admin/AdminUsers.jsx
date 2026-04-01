import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = (q = '') =>
    api.get(`/admin/users${q ? `?search=${q}` : ''}`)
      .then(r => setUsers(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleUpdate = async (id, data) => {
    try {
      await api.put(`/admin/users/${id}`, data);
      toast.success('User updated');
      setEditing(null);
      load(search);
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setUsers(u => u.filter(x => x._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const statusColor = { active: 'badge-green', inactive: 'badge-red', cancelled: 'badge-gray' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Users</h1>
        <span className="badge-gray">{users.length} users</span>
      </div>

      <input className="input mb-6 max-w-sm" type="text" placeholder="Search by name or email…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="text-gold animate-pulse">Loading…</div>
      ) : (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u._id} className="card">
              {editing === u._id ? (
                <EditUser user={u} onSave={(data) => handleUpdate(u._id, data)} onCancel={() => setEditing(null)} />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{u.name}</div>
                      <div className="text-white/40 text-sm">{u.email}</div>
                      {u.selectedCharity && <div className="text-white/30 text-xs">Charity: {u.selectedCharity.name}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={statusColor[u.subscriptionStatus] || 'badge-gray'}>{u.subscriptionStatus}</span>
                    {u.subscriptionPlan && <span className="badge-gray">{u.subscriptionPlan}</span>}
                    <span className="text-white/30 text-xs">Won: £{(u.totalWon || 0).toFixed(2)}</span>
                    <button onClick={() => setEditing(u._id)} className="text-gold hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:underline text-xs">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditUser({ user, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan || 'monthly',
  });
  return (
    <div className="grid grid-cols-2 gap-4">
      <div><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
      <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
      <div>
        <label className="label">Status</label>
        <select className="input" value={form.subscriptionStatus} onChange={e => setForm(p => ({ ...p, subscriptionStatus: e.target.value }))}>
          {['active','inactive','cancelled','past_due'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Plan</label>
        <select className="input" value={form.subscriptionPlan} onChange={e => setForm(p => ({ ...p, subscriptionPlan: e.target.value }))}>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="col-span-2 flex gap-3">
        <button onClick={() => onSave(form)} className="btn-gold text-sm py-2">Save</button>
        <button onClick={onCancel} className="btn-outline text-sm py-2">Cancel</button>
      </div>
    </div>
  );
}
