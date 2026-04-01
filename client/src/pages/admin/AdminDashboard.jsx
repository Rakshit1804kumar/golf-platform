import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gold animate-pulse">Loading stats…</div>;

  const cards = [
    { label: 'Total users',       value: stats.totalUsers,                  icon: '👥', color: 'text-blue-400' },
    { label: 'Active subscribers',value: stats.activeUsers,                 icon: '✅', color: 'text-green-400' },
    { label: 'Monthly revenue',   value: `£${stats.monthlyRevenue?.toFixed(2)}`, icon: '💰', color: 'text-gold' },
    { label: 'Charity this month',value: `£${stats.charityTotal?.toFixed(2)}`,   icon: '🎗️', color: 'text-pink-400' },
    { label: 'Total paid out',    value: `£${stats.totalPaidOut?.toFixed(2)}`,   icon: '🏆', color: 'text-gold' },
    { label: 'Pending winners',   value: stats.pendingWinners,              icon: '⏳', color: 'text-amber-400' },
    { label: 'Published draws',   value: stats.totalDraws,                  icon: '🎰', color: 'text-purple-400' },
    { label: 'Charities listed',  value: stats.charities,                   icon: '📋', color: 'text-teal-400' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Admin dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Platform overview</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{icon}</span>
              <span className={`font-display text-2xl font-bold ${color}`}>{value}</span>
            </div>
            <div className="text-white/50 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Subscription health bar */}
      {stats && (
        <div className="card mt-6">
          <h2 className="text-white font-semibold mb-4">Subscription health</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-navy rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-green-400 rounded-full transition-all"
                style={{ width: `${stats.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}
              />
            </div>
            <span className="text-white/60 text-sm shrink-0">
              {stats.activeUsers}/{stats.totalUsers} active ({stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
