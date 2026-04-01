import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-navy font-bold text-sm">G</span>
            <span className="font-display text-xl font-bold text-white">Golf<span className="text-gold">Gives</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/charities" className={`text-sm font-medium transition-colors ${isActive('/charities') ? 'text-gold' : 'text-white/70 hover:text-white'}`}>
              Charities
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-gold' : 'text-white/70 hover:text-white'}`}>Dashboard</Link>
                <Link to="/scores"    className={`text-sm font-medium transition-colors ${isActive('/scores') ? 'text-gold' : 'text-white/70 hover:text-white'}`}>Scores</Link>
                <Link to="/draws"     className={`text-sm font-medium transition-colors ${isActive('/draws') ? 'text-gold' : 'text-white/70 hover:text-white'}`}>Draws</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-gold/80 hover:text-gold transition-colors">⚙ Admin</Link>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">Hi, {user.name?.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-sm text-white/60 hover:text-white transition-colors">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login"  className="text-sm font-medium text-white/70 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="btn-gold text-sm py-2 px-4">Join Now</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-white/70 hover:text-white">
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-current transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 bg-current transition-all ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-current transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-3">
            <Link to="/charities" onClick={() => setOpen(false)} className="block text-white/70 hover:text-white py-1">Charities</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-white/70 hover:text-white py-1">Dashboard</Link>
                <Link to="/scores"    onClick={() => setOpen(false)} className="block text-white/70 hover:text-white py-1">Scores</Link>
                <Link to="/draws"     onClick={() => setOpen(false)} className="block text-white/70 hover:text-white py-1">Draws</Link>
                {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block text-gold py-1">Admin</Link>}
                <button onClick={() => { handleLogout(); setOpen(false); }} className="block text-white/60 py-1">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"  onClick={() => setOpen(false)} className="block text-white/70 hover:text-white py-1">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="block btn-gold w-fit mt-2">Join Now</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
