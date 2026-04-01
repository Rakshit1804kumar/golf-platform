import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all'); // all | pending | approved | rejected

  const load = () =>
    api.get('/winners/admin/all').then(r => setWinners(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/winners/admin/${id}/verify`, { status });
      toast.success(`Winner ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handlePay = async (id) => {
    try {
      await api.put(`/winners/admin/${id}/pay`);
      toast.success('Marked as paid');
      load();
    } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? winners : winners.filter(w => w.verificationStatus === filter);

  const verifyColor  = { pending: 'badge-gold', approved: 'badge-green', rejected: 'badge-red' };
  const paymentColor = { pending: 'badge-gray', paid: 'badge-green' };
  const matchColors  = { '5-match': 'text-gold', '4-match': 'text-blue-400', '3-match': 'text-green-400' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Winners</h1>
        <span className="badge-gray">{winners.length} total</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-gold text-navy' : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gold animate-pulse">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">No winners found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(w => (
            <div key={w._id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className={`font-display text-lg font-bold ${matchColors[w.matchType]}`}>{w.matchType}</span>
                    <span className={verifyColor[w.verificationStatus]}>{w.verificationStatus}</span>
                    <span className={paymentColor[w.paymentStatus]}>{w.paymentStatus}</span>
                  </div>
                  <div className="text-white font-medium">{w.user?.name}</div>
                  <div className="text-white/40 text-sm">{w.user?.email}</div>
                  <div className="text-white/40 text-xs mt-1">
                    Draw: {w.draw?.month ? new Date(w.draw.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'N/A'}
                  </div>
                  {w.draw?.winningNumbers?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {w.draw.winningNumbers.map((n, i) => (
                        <span key={i} className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-bold flex items-center justify-center">{n}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-gold font-display text-2xl font-bold">
                    £{w.prizeAmount?.toFixed(2)}
                  </div>

                  {/* Proof */}
                  {w.proofUrl ? (
                    <a href={w.proofUrl} target="_blank" rel="noopener noreferrer"
                      className="text-gold text-xs hover:underline">View proof ↗</a>
                  ) : (
                    <span className="text-white/30 text-xs">No proof uploaded</span>
                  )}

                  {/* Verification actions */}
                  {w.verificationStatus === 'pending' && w.proofUrl && (
                    <div className="flex gap-2">
                      <button onClick={() => handleVerify(w._id, 'approved')}
                        className="btn-gold text-xs py-1.5 px-3">Approve ✓</button>
                      <button onClick={() => handleVerify(w._id, 'rejected')}
                        className="text-xs py-1.5 px-3 border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10 transition-all">
                        Reject ✕
                      </button>
                    </div>
                  )}

                  {/* Payment action */}
                  {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                    <button onClick={() => handlePay(w._id)} className="btn-outline text-xs py-1.5 px-3">
                      Mark as paid →
                    </button>
                  )}
                </div>
              </div>

              {w.adminNote && (
                <div className="mt-3 pt-3 border-t border-white/10 text-white/40 text-xs">
                  Admin note: {w.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
