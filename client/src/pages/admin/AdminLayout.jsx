import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin',            label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users',      label: 'Users',     icon: '👥' },
  { to: '/admin/draws',      label: 'Draws',     icon: '🎰' },
  { to: '/admin/charities',  label: 'Charities', icon: '🎗️' },
  { to: '/admin/winners',    label: 'Winners',   icon: '🏆' },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate border-r border-white/10 p-4">
        <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4 px-2">Admin</div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive ? 'bg-gold/10 text-gold border border-gold/30' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
}
