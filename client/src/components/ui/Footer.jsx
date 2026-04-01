import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-navy mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-navy font-bold text-sm">G</span>
              <span className="font-display text-xl font-bold text-white">Golf<span className="text-gold">Gives</span></span>
            </div>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              Where every swing supports a cause. Subscribe, play, and give back — all in one platform.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/charities', 'Charities'], ['/signup', 'Join Now'], ['/login', 'Login']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-white/50 hover:text-gold text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Draw Rules'].map(l => (
                <li key={l}><span className="text-white/50 text-sm cursor-not-allowed">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} GolfGives. All rights reserved.</p>
          <p className="text-white/30 text-xs">Built with ♥ for golfers who care</p>
        </div>
      </div>
    </footer>
  );
}
